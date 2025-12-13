import { useState, useEffect } from "react";
import {
    Link2,
    Trash2,
    Copy,
    Check,
    Eye,
    Clock,
    Shield,
    AlertCircle,
    Edit,
} from "lucide-react";
import { sharedLinksApi } from "@/lib/api/endpoints/sharedLinks";
import type { SharedLink } from "@/types/sharedLink.types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import EditShareModal from "@/components/shared/EditShareModal";
import DeleteShareModal from "@/components/shared/DeleteShareModal";

export default function MySharesPage() {
    const [shares, setShares] = useState<SharedLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingShare, setEditingShare] = useState<SharedLink | null>(null);
    const [deletingShare, setDeletingShare] = useState<SharedLink | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadShares();
    }, []);

    const loadShares = async () => {
        try {
            setLoading(true);
            const response = await sharedLinksApi.getUserLinks();
            // Backend wraps: { success, data: { data: [...], meta }, timestamp }
            // getUserLinks returns full response, so we need response.data.data
            const sharesData = response?.data?.data || [];
            setShares(sharesData);
        } catch (err: any) {
            toast.error("Failed to load shares");
            console.error("Load shares error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (url: string, id: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success("Link copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUpdate = async (data: {
        expiresIn?: number;
        password?: string | null;
    }) => {
        if (!editingShare) return;

        try {
            setActionLoading(true);
            await sharedLinksApi.update(editingShare.id, data);
            toast.success("Share link updated");
            setEditingShare(null);
            loadShares();
        } catch (err: any) {
            toast.error("Failed to update share");
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!deletingShare) return;

        try {
            setActionLoading(true);
            await sharedLinksApi.revoke(deletingShare.id);
            toast.success("Share link revoked");
            setDeletingShare(null);
            loadShares();
        } catch (err: any) {
            toast.error("Failed to revoke share");
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!deletingShare) return;

        try {
            setActionLoading(true);
            await sharedLinksApi.permanentlyDelete(deletingShare.id);
            toast.success("Share link permanently deleted");
            setDeletingShare(null);
            loadShares();
        } catch (err: any) {
            toast.error("Failed to delete share");
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Loading shares...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                        <Link2 className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            My Shares
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Manage your shared links
                        </p>
                    </div>
                </div>
                {shares.length > 0 && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-4">
                        {shares.length} share link
                        {shares.length !== 1 ? "s" : ""} created
                    </p>
                )}
            </div>

            {/* Shares List */}
            {shares.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 border border-neutral-200 dark:border-neutral-700 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                            <Link2 className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No shares yet
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        Start sharing items by clicking the Share button in any
                        item detail panel
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {shares.map((share) => {
                        const expired = isExpired(share.expiresAt);
                        const active = !share.revoked && !expired;

                        return (
                            <div
                                key={share.id}
                                className={`bg-white dark:bg-neutral-800 rounded-xl border p-4 shadow-sm transition-all ${
                                    active
                                        ? "border-neutral-200 dark:border-neutral-700 hover:shadow-md"
                                        : "border-neutral-200 dark:border-neutral-700 opacity-60"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                                {share.item.title}
                                            </h3>
                                            <Badge variant="outline" size="sm">
                                                {share.item.type}
                                            </Badge>
                                        </div>

                                        {/* Share Link */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={share.url}
                                                readOnly
                                                className="flex-1 px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 truncate"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleCopy(
                                                        share.url,
                                                        share.id
                                                    )
                                                }
                                                disabled={!active}
                                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Copy link"
                                            >
                                                {copiedId === share.id ? (
                                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>
                                                    {expired
                                                        ? "Expired"
                                                        : "Expires"}{" "}
                                                    {new Date(
                                                        share.expiresAt
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>
                                                    {share.accessCount || 0}{" "}
                                                    views
                                                </span>
                                            </div>
                                            {share.hasPassword && (
                                                <div className="flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    <span>
                                                        Password protected
                                                    </span>
                                                </div>
                                            )}
                                            {share.revoked && (
                                                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>Revoked</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setEditingShare(share)
                                            }
                                            title={
                                                share.revoked
                                                    ? "Edit & Restore"
                                                    : "Edit"
                                            }
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() =>
                                                setDeletingShare(share)
                                            }
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Modal */}
            {editingShare && (
                <EditShareModal
                    isOpen={!!editingShare}
                    onClose={() => setEditingShare(null)}
                    onSave={handleUpdate}
                    currentExpiration={editingShare.expiresAt}
                    hasPassword={editingShare.hasPassword}
                    revoked={editingShare.revoked}
                />
            )}

            {/* Delete Modal */}
            {deletingShare && (
                <DeleteShareModal
                    isOpen={!!deletingShare}
                    onClose={() => setDeletingShare(null)}
                    onRevoke={handleRevoke}
                    onPermanentDelete={handlePermanentDelete}
                    itemTitle={deletingShare.item.title}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}
