Rất rõ 👍
Dưới đây là **bộ PROMPT hoàn chỉnh** để bạn dùng cho **AI agent (code agent / dev agent)** triển khai **full QR Generator tool** đúng như bạn mô tả: nhiều payload, design, templates, frames, logo, export **PNG + SVG + PDF**, chạy **offline (FE-only, React)**.

Bạn có thể dùng nguyên văn các prompt này cho:

-   Cursor / Windsurf / Devin / Copilot Workspace
-   ChatGPT Code Agent
-   Claude / Gemini code agent

---

# 🧠 PROMPT MASTER (tổng thể – dùng đầu tiên)

```
You are a senior frontend engineer and product architect.

Your task is to build a fully offline QR Code Generator web application using React.

The application must support:
- Multiple QR payload types (URL, Text, Email, WiFi, Phone, SMS, WhatsApp, vCard, Geo, Calendar)
- Advanced QR styling (shapes, dots, corners, colors, gradients, logo)
- Frames and captions around the QR
- Templates/presets system
- Export QR codes as PNG, SVG, and PDF
- No backend, fully offline (localStorage or IndexedDB)

Use:
- React + TypeScript
- qr-code-styling as the QR engine
- pdf-lib for PDF export

Focus on:
- Clean architecture
- Scalable state design
- High-quality export (no blur)
- QR scannability best practices

Proceed step by step.
```

---

# 🧩 PROMPT 1 — Payload system (QR content types)

```
Design a payload builder system for a QR generator.

Requirements:
- Support URL, Text, Email, Phone, SMS, WhatsApp, WiFi, vCard, Geolocation, Calendar Event
- Each payload type should have its own form schema
- Convert form data into a valid QR string according to standards
- Ensure proper escaping for special characters
- The output must be directly usable by qr-code-styling

Return:
- TypeScript types
- Payload builder functions
- Example payload outputs for each type
```

---

# 🎨 PROMPT 2 — QR Design & Styling Engine

```
Implement an advanced QR styling system using qr-code-styling.

Requirements:
- Support dots styles (square, rounded, dots, classy, extra-rounded)
- Support corner square styles and corner dot styles
- Support solid colors and gradients
- Background color control
- Logo/image embedding with safe size limits
- Automatic errorCorrectionLevel handling when logo is enabled
- Live preview updates without remounting React components

Return:
- QR options state shape
- React hook or utility to update QR styles efficiently
- Best practices to keep QR scannable
```

---

# 🖼️ PROMPT 3 — Frame & Caption System

```
Design a QR Frame system.

Requirements:
- Frames rendered as HTML/CSS around the QR (not part of QR matrix)
- Support caption text (e.g. "SCAN ME")
- Support icons inside the frame
- Adjustable padding, border radius, background
- Multiple frame templates (simple, badge, sticker, rounded card)
- Frame must be included in export

Return:
- Frame style schema
- React component structure
- CSS strategy for flexible frames
```

---

# 💾 PROMPT 4 — Templates / Presets

```
Implement a template (preset) system for a QR generator.

Requirements:
- Save full QR configuration (payload + design + frame)
- Load, update, delete templates
- Persist templates using localStorage (IndexedDB optional)
- Allow users to apply a template instantly
- Templates must be serializable JSON

Return:
- Template data model
- Storage utilities
- Example template objects
```

---

# 📤 PROMPT 5 — Export PNG / SVG / PDF (HIGH QUALITY)

```
Implement export functionality for a QR generator.

Requirements:
- Export QR-only as PNG (high resolution, no blur)
- Export QR-only as SVG
- Export full frame (QR + caption + frame) as PNG
- Export PDF with QR centered on A4 page
- PDF must embed high-resolution PNG
- Handle retina scaling (2x, 4x)
- Avoid CORS issues with logo images

Return:
- Export utility functions
- Explanation of scaling strategy
- Example React usage
```

---

# ⚡ PROMPT 6 — Performance & UX

```
Optimize the QR generator for performance and UX.

Requirements:
- Prevent unnecessary QR re-instantiation
- Debounce payload input changes
- Ensure instant visual feedback
- Avoid layout shift during export
- Handle large logo images safely

Return:
- Recommended state architecture
- Performance tips specific to qr-code-styling
```

---

# 🧱 PROMPT 7 — Project Architecture

```
Propose a scalable React project architecture for the QR generator.

Requirements:
- Clear separation of concerns
- Reusable components
- Easy to extend with new payload types
- Easy to add backend later (dynamic QR)

Return:
- Folder structure
- Responsibility of each module
- Data flow diagram (text-based)
```

---

# 🔒 PROMPT 8 — QR Safety & Scan Reliability

```
Define QR code safety and scan reliability rules.

Requirements:
- Contrast validation rules
- Logo size limits
- Minimum quiet zone
- Gradient restrictions
- Error correction strategies

Return:
- Validation checklist
- Warnings to show in UI
```

---
