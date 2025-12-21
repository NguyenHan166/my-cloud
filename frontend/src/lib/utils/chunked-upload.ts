import apiClient from "../api/client";

export interface ChunkedUploadOptions {
    file: File;
    onProgress?: (progress: number) => void;
    onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
    onPause?: () => void;
    onResume?: () => void;
    onError?: (error: Error) => void;
    concurrency?: number; // Max parallel chunk uploads
}

export interface UploadSession {
    sessionId: string;
    uploadId: string;
    key: string;
    chunkSize: number;
    totalParts: number;
}

export class ChunkedUploader {
    private file: File;
    private session: UploadSession | null = null;
    private uploadedParts: Map<number, string> = new Map(); // partNumber -> ETag
    private isPaused = false;
    private isAborted = false;
    private options: Required<ChunkedUploadOptions>;

    constructor(options: ChunkedUploadOptions) {
        this.file = options.file;
        this.options = {
            concurrency: 3,
            onProgress: () => {},
            onChunkComplete: () => {},
            onPause: () => {},
            onResume: () => {},
            onError: () => {},
            ...options,
        };
    }

    /**
     * Start upload (or resume if session exists in localStorage)
     */
    async start(): Promise<{ key: string; url: string }> {
        try {
            // Check for existing session
            await this.loadOrCreateSession();

            // Upload chunks
            await this.uploadChunks();

            // Complete upload
            const result = await this.complete();

            // Cleanup
            this.cleanup();

            return result;
        } catch (error) {
            this.options.onError(error as Error);
            throw error;
        }
    }

    /**
     * Pause upload
     */
    pause(): void {
        this.isPaused = true;
        this.saveSession();
        this.options.onPause();
    }

    /**
     * Resume upload
     */
    resume(): void {
        this.isPaused = false;
        this.options.onResume();
        // Continue upload in existing start() promise
    }

    /**
     * Abort upload
     */
    async abort(): Promise<void> {
        this.isAborted = true;
        if (this.session) {
            await apiClient.delete(
                `/upload/chunked/${this.session.sessionId}/abort`
            );
        }
        this.cleanup();
    }

    /**
     * Load existing session from localStorage or create new one
     */
    private async loadOrCreateSession(): Promise<void> {
        const savedSession = this.loadSession();

        if (savedSession) {
            // Resume existing upload
            this.session = savedSession.session;
            this.uploadedParts = new Map(savedSession.uploadedParts);
            if (!this.session) {
                throw new Error("Invalid session data");
            }
            console.log(
                `[ChunkedUploader] Resuming upload: ${this.uploadedParts.size}/${this.session.totalParts} parts uploaded`
            );
        } else {
            // Initiate new upload
            const response = await apiClient.post("/upload/chunked/initiate", {
                filename: this.file.name,
                mimetype: this.file.type,
                size: this.file.size,
            });

            console.log("[ChunkedUploader] Raw response:", response);
            console.log("[ChunkedUploader] response.data:", response.data);
            console.log(
                "[ChunkedUploader] response.data.data:",
                response.data.data
            );

            // Backend wraps response in {success, data, timestamp}
            this.session = response.data.data;
            console.log("[ChunkedUploader] Extracted session:", this.session);

            if (!this.session) {
                throw new Error("Failed to create upload session");
            }
            this.saveSession();
            console.log(
                `[ChunkedUploader] Started new upload: sessionId=${this.session.sessionId}, totalParts=${this.session.totalParts}`
            );
        }
    }

    /**
     * Upload all chunks with concurrency control
     */
    private async uploadChunks(): Promise<void> {
        if (!this.session) throw new Error("No upload session");

        const { totalParts } = this.session;
        const pendingParts: number[] = [];

        // Find parts that haven't been uploaded yet
        for (let i = 1; i <= totalParts; i++) {
            if (!this.uploadedParts.has(i)) {
                pendingParts.push(i);
            }
        }

        console.log(
            `[ChunkedUploader] Uploading ${pendingParts.length} pending parts...`
        );

        // Upload chunks with concurrency control
        const queue = [...pendingParts];
        const activeUploads: Promise<void>[] = [];

        while (queue.length > 0 || activeUploads.length > 0) {
            // Check pause/abort
            if (this.isPaused) {
                await new Promise<void>((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (!this.isPaused || this.isAborted) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                });
            }

            if (this.isAborted) {
                throw new Error("Upload aborted");
            }

            // Start new uploads up to concurrency limit
            while (
                activeUploads.length < this.options.concurrency &&
                queue.length > 0
            ) {
                const partNumber = queue.shift()!;
                const uploadPromise = this.uploadPart(partNumber);
                activeUploads.push(uploadPromise);
            }

            // Wait for at least one upload to complete
            if (activeUploads.length > 0) {
                await Promise.race(activeUploads);
                // Remove completed uploads
                for (let i = activeUploads.length - 1; i >= 0; i--) {
                    const settled = await Promise.race([
                        activeUploads[i].then(() => true),
                        Promise.resolve(false),
                    ]);
                    if (settled) {
                        activeUploads.splice(i, 1);
                    }
                }
            }
        }
    }

    /**
     * Upload a single part
     */
    private async uploadPart(partNumber: number): Promise<void> {
        if (!this.session) throw new Error("No upload session");

        const { chunkSize } = this.session;
        const start = (partNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, this.file.size);
        const chunk = this.file.slice(start, end);

        // Get presigned URL
        const urlResponse = await apiClient.get(
            `/upload/chunked/${this.session.sessionId}/part/${partNumber}`
        );
        // Backend wraps response in {success, data, timestamp}
        const { presignedUrl } = urlResponse.data.data;

        // Upload chunk directly to R2
        const response = await fetch(presignedUrl, {
            method: "PUT",
            body: chunk,
            headers: {
                "Content-Type": this.file.type,
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to upload part ${partNumber}: ${response.statusText}`
            );
        }

        const etag = response.headers.get("ETag");
        if (!etag) {
            throw new Error(`No ETag returned for part ${partNumber}`);
        }

        // Save ETag
        this.uploadedParts.set(partNumber, etag);
        this.saveSession();

        // Update progress
        const progress =
            (this.uploadedParts.size / this.session.totalParts) * 100;
        this.options.onProgress(progress);
        this.options.onChunkComplete(partNumber, this.session.totalParts);
    }

    /**
     * Complete multipart upload
     */
    private async complete(): Promise<{ key: string; url: string }> {
        if (!this.session) throw new Error("No upload session");

        console.log(
            "[ChunkedUploader] Completing upload, session:",
            this.session
        );
        console.log("[ChunkedUploader] sessionId:", this.session.sessionId);
        console.log(
            "[ChunkedUploader] uploadedParts size:",
            this.uploadedParts.size
        );

        const parts = Array.from(this.uploadedParts.entries())
            .map(([partNumber, etag]) => ({
                PartNumber: partNumber,
                ETag: etag,
            }))
            .sort((a, b) => a.PartNumber - b.PartNumber);

        console.log("[ChunkedUploader] Completing with", parts.length, "parts");

        const response = await apiClient.post(
            `/upload/chunked/${this.session.sessionId}/complete`,
            { parts }
        );

        // Backend wraps response in {success, data, timestamp}
        return response.data.data;
    }

    /**
     * Save session to localStorage
     */
    private saveSession(): void {
        if (!this.session) return;

        const key = `upload_session_${this.file.name}_${this.file.size}`;
        localStorage.setItem(
            key,
            JSON.stringify({
                session: this.session,
                uploadedParts: Array.from(this.uploadedParts.entries()),
                timestamp: Date.now(),
            })
        );
    }

    /**
     * Load session from localStorage
     */
    private loadSession(): {
        session: UploadSession;
        uploadedParts: [number, string][];
    } | null {
        const key = `upload_session_${this.file.name}_${this.file.size}`;
        const saved = localStorage.getItem(key);

        if (!saved) return null;

        try {
            const data = JSON.parse(saved);

            // Check if session is not expired (24 hours)
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(key);
                return null;
            }

            // MIGRATION: Handle old format where session was wrapped in response envelope
            let session = data.session;
            if (session && typeof session === "object" && "data" in session) {
                // Old format: {session: {success, data, timestamp}, ...}
                console.warn("[ChunkedUploader] Migrating old session format");
                session = session.data; // Extract actual session from wrapper
            }

            // Validate session has required fields
            if (
                !session ||
                !session.sessionId ||
                !session.uploadId ||
                !session.key
            ) {
                console.warn(
                    "[ChunkedUploader] Invalid session in localStorage, clearing..."
                );
                localStorage.removeItem(key);
                return null;
            }

            return {
                session,
                uploadedParts: data.uploadedParts || [],
            };
        } catch (error) {
            console.error(
                "[ChunkedUploader] Failed to parse saved session:",
                error
            );
            localStorage.removeItem(key);
            return null;
        }
    }

    /**
     * Cleanup session from localStorage
     */
    private cleanup(): void {
        const key = `upload_session_${this.file.name}_${this.file.size}`;
        localStorage.removeItem(key);
    }
}
