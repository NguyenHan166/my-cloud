/**
 * Background service worker for PersonalCloud Extension
 * Handles context menus, notifications, and background tasks
 */
import { itemsApi, isAuthenticated, getAccessToken } from "@/lib/api";

// API Configuration (duplicated for background script isolation)
const API_BASE_URL = "https://apistorage.nguyenvanhan.io.vn";
const API_PREFIX = "/api";

export default defineBackground(() => {
    console.log("PersonalCloud Extension initialized", {
        id: browser.runtime.id,
    });

    // Create context menus on install
    browser.runtime.onInstalled.addListener(() => {
        // Upload image from context menu
        browser.contextMenus.create({
            id: "upload-image",
            title: "Upload to PersonalCloud",
            contexts: ["image"],
        });

        // Save link to cloud
        browser.contextMenus.create({
            id: "save-link",
            title: "Save link to PersonalCloud",
            contexts: ["link"],
        });

        // Save page as bookmark
        browser.contextMenus.create({
            id: "save-page",
            title: "Save page to PersonalCloud",
            contexts: ["page"],
        });
    });

    // Handle context menu clicks
    browser.contextMenus.onClicked.addListener(async (info, tab) => {
        // Check authentication first
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            showNotification(
                "Please Login",
                "Please login to PersonalCloud extension first."
            );
            return;
        }

        try {
            switch (info.menuItemId) {
                case "upload-image":
                    if (info.srcUrl) {
                        await handleUploadImage(info.srcUrl);
                    }
                    break;

                case "save-link":
                    if (info.linkUrl) {
                        const linkText = info.selectionText || info.linkUrl;
                        await handleSaveLink(info.linkUrl, linkText);
                    }
                    break;

                case "save-page":
                    if (tab?.url && tab?.title) {
                        await handleSaveLink(tab.url, tab.title);
                    }
                    break;
            }
        } catch (error) {
            console.error("Context menu action failed:", error);
            showNotification(
                "Error",
                error instanceof Error ? error.message : "Action failed"
            );
        }
    });
});

// Show browser notification
function showNotification(title: string, message: string) {
    browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("/icon/128.png"),
        title: `PersonalCloud - ${title}`,
        message,
    });
}

// Upload image from URL
async function handleUploadImage(imageUrl: string) {
    try {
        showNotification("Uploading", "Downloading and uploading image...");

        // Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error("Failed to download image");
        }

        const blob = await response.blob();

        // Get filename from URL
        const urlParts = imageUrl.split("/");
        let filename = urlParts[urlParts.length - 1].split("?")[0];
        if (!filename || !filename.includes(".")) {
            const extension = blob.type.split("/")[1] || "png";
            filename = `image_${Date.now()}.${extension}`;
        }

        // Create File from blob
        const file = new File([blob], filename, { type: blob.type });

        // Upload using items API
        const token = await getAccessToken();

        const formData = new FormData();
        formData.append("type", "FILE");
        formData.append("title", filename);
        formData.append("files", file);

        const uploadResponse = await fetch(
            `${API_BASE_URL}${API_PREFIX}/items`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || "Upload failed");
        }

        showNotification(
            "Success",
            `Image "${filename}" uploaded successfully!`
        );
    } catch (error) {
        throw new Error(
            `Failed to upload image: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

// Save link/bookmark
async function handleSaveLink(url: string, title: string) {
    const result = await itemsApi.createLink(url, title);

    if (result.error) {
        throw new Error(result.error);
    }

    showNotification(
        "Link Saved",
        `"${title.slice(0, 50)}${title.length > 50 ? "..." : ""}"`
    );
}
