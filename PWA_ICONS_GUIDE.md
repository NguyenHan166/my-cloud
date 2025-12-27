# Hướng dẫn tạo PWA Icons

## Yêu cầu

Cần tạo 2 icon cho PWA với các kích thước:

-   **192x192px**: Icon hiển thị trên màn hình chính và trong trình cài đặt
-   **512x512px**: Icon hiển thị khi cài đặt và splash screen

## Cách tạo Icons

### Option 1: Sử dụng công cụ online

1. Truy cập https://www.pwabuilder.com/imageGenerator
2. Upload logo của bạn (khuyến nghị file PNG với nền trong suốt)
3. Download các icon được tạo tự động
4. Copy 2 file `pwa-192x192.png` và `pwa-512x512.png` vào thư mục `frontend/public/`

### Option 2: Tự tạo bằng Photoshop/Figma

1. Tạo design vuông (192x192 hoặc 512x512)
2. Xuất file PNG với:
    - Nền trong suốt hoặc màu solid
    - Chất lượng cao
    - Tên file: `pwa-192x192.png` và `pwa-512x512.png`
3. Copy vào thư mục `frontend/public/`

### Option 3: Sử dụng ImageMagick (nếu đã có logo)

```bash
# Resize từ logo hiện có
magick convert logo.png -resize 192x192 pwa-192x192.png
magick convert logo.png -resize 512x512 pwa-512x512.png
```

## Lưu ý quan trọng

-   Icons nên có padding khoảng 10-20% để tránh bị cắt
-   Nên sử dụng màu nền hoặc trong suốt
-   File nên tối ưu dung lượng (< 100KB)
-   Đặt đúng tên file như trong manifest

## Vị trí file

```
frontend/
├── public/
│   ├── pwa-192x192.png  ← Tạo file này
│   ├── pwa-512x512.png  ← Tạo file này
│   └── favicon.ico
```

## Test PWA

Sau khi tạo icon và build:

1. Build project: `npm run build`
2. Deploy lên Cloudflare Pages
3. Truy cập web trên mobile
4. Banner "Cài đặt ứng dụng" sẽ hiện ra
5. Click "Cài đặt" để thêm app vào màn hình chính

## PWA Manifest đã được cấu hình

Manifest trong `vite.config.ts` đã được cấu hình với:

-   Name: "Personal Cloud"
-   Short name: "PersonalCloud"
-   Theme color: #ffffff
-   Display mode: standalone
-   Auto-update service worker
