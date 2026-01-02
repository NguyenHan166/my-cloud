import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-react"],
    manifest: {
        name: "CloudHan",
        description:
            "Quick access to your PersonalCloud storage - upload files, save links, and manage your cloud.",
        version: "1.0.0",
        permissions: ["storage", "contextMenus", "activeTab", "notifications"],
        host_permissions: [
            "https://apistorage.nguyenvanhan.io.vn/*",
            "https://*/*",
            "http://*/*",
        ],
        icons: {
            16: "icon/CloudHan.png",
            32: "icon/CloudHan.png",
            48: "icon/CloudHan.png",
            96: "icon/CloudHan.png",
            128: "icon/CloudHan.png",
        },
        action: {
            default_title: "CloudHan",
            default_icon: {
                16: "icon/CloudHan.png",
                32: "icon/CloudHan.png",
                48: "icon/CloudHan.png",
            },
        },
    },
});
