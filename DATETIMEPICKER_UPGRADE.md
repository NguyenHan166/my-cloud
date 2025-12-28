# Professional DateTimePicker Component 🎨✨

## 🚀 Nâng cấp lên phiên bản chuyên nghiệp!

DateTimePicker đã được nâng cấp hoàn toàn với UI/UX chuyên nghiệp, thay thế native HTML5 input bằng custom calendar component.

## ✨ Tính năng mới

### 1. **Custom Calendar UI**

-   📅 Calendar grid đẹp mắt với ngày hiện tại được highlight
-   🎯 Click vào ngày để chọn nhanh
-   ⬅️➡️ Navigation buttons để chuyển tháng
-   🚫 Disable các ngày trong quá khứ
-   🌙 Full dark mode support

### 2. **Preset Shortcuts** ⚡

Quick selection buttons:

-   **⏰ 1 giờ nữa** - Đặt reminder 1 giờ từ bây giờ
-   **⏰ 3 giờ nữa** - Đặt reminder 3 giờ từ bây giờ
-   **🌅 Ngày mai 9h** - Reminder vào 9 giờ sáng ngày mai
-   **📅 Tuần sau** - Reminder vào tuần sau lúc 9h sáng

### 3. **Time Picker**

-   🕐 Number inputs cho giờ (0-23) và phút (0-59)
-   ⌨️ Auto-validation và clamping
-   🎯 Easy to use với keyboard

### 4. **Smart UI/UX**

-   🎨 Gradient backgrounds với màu sắc đẹp mắt
-   💫 Hover effects và animations
-   ✅ Selected state với highlight màu xanh
-   🔵 Current date indicator
-   📍 Absolute positioning dropdown (không làm layout shift)

### 5. **Better Display**

-   📝 Formatted display với định dạng Việt Nam
-   🗑️ Clear button dễ nhìn với icon X
-   💡 Hint text thông tin
-   🎯 Visual feedback khi có/không có giá trị

## 🎨 Screenshots

### Display Mode

```
┌─────────────────────────────────────┐
│ 🔔 Nhắc nhở                        │
├─────────────────────────────────────┤
│ 28/12/2025, 15:30              [X] │ <- Hiển thị giá trị
└─────────────────────────────────────┘
  🔔 Bạn sẽ nhận email nhắc nhở...
```

### Calendar Dropdown

```
┌──────────────────────────────────┐
│ NHANH                            │
│ ┌──────────┐  ┌──────────┐      │
│ │⏰ 1 giờ  │  │⏰ 3 giờ  │      │
│ │  nữa     │  │  nữa     │      │
│ └──────────┘  └──────────┘      │
│ ┌──────────┐  ┌──────────┐      │
│ │🌅 Ngày   │  │📅 Tuần   │      │
│ │  mai 9h  │  │  sau     │      │
│ └──────────┘  └──────────┘      │
├──────────────────────────────────┤
│    ◀  Tháng 12 2025  ▶          │
├──────────────────────────────────┤
│ CN T2 T3 T4 T5 T6 T7            │
│  1  2  3  4  5  6  7            │
│  8  9 10 11 12 13 14            │
│ 15 16 17 18 19 20 21            │
│ 22 23 24 25 26 27 [28]          │ <- Selected
│ 29 30 31                         │
├──────────────────────────────────┤
│ 🕐 Thời gian                    │
│ [15] : [30]                     │
├──────────────────────────────────┤
│ [   Hủy   ]  [ Xác nhận ]       │
└──────────────────────────────────┘
```

## 💻 Usage

### Basic

```tsx
import { DateTimePicker } from "@/components/ui/DateTimePicker";

function MyForm() {
    const [reminderAt, setReminderAt] = useState<string | null>(null);

    return (
        <DateTimePicker
            value={reminderAt}
            onChange={setReminderAt}
            label="Nhắc nhở"
            placeholder="Chọn thời gian nhắc nhở"
        />
    );
}
```

### With Custom Props

```tsx
<DateTimePicker
    value={reminderAt}
    onChange={setReminderAt}
    label="Deadline Notification"
    placeholder="When to remind?"
    disabled={isLoading}
    minDate={new Date()} // Default: now
/>
```

## 🎯 Props

```typescript
interface DateTimePickerProps {
    value?: string | null; // ISO 8601 datetime string
    onChange: (value: string | null) => void;
    label?: string; // Default: "Nhắc nhở"
    placeholder?: string; // Default: "Chọn thời gian nhắc nhở"
    disabled?: boolean; // Default: false
    minDate?: Date; // Default: new Date()
}
```

## 🎨 Styling Features

### Color Scheme

-   **Preset buttons**: Gradient blue to indigo
-   **Selected day**: Solid blue with shadow
-   **Today**: Light blue background
-   **Disabled**: Gray with no interaction
-   **Clear button**: Red hover state
-   **Apply button**: Gradient blue to indigo

### Animations

-   ✨ Scale on preset button hover
-   💫 Shadow effects on interaction
-   🌊 Smooth transitions
-   🎭 Subtle hover states

### Dark Mode

All colors have dark mode variants:

-   Proper contrast ratios
-   Adjusted opacity for readability
-   Gradient backgrounds adapted

## 🔄 State Management

### Internal State

```typescript
const [isOpen, setIsOpen] = useState(false); // Dropdown visibility
const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Selected date
const [viewDate, setViewDate] = useState(new Date()); // Calendar view month
const [hours, setHours] = useState(9); // Time hours
const [minutes, setMinutes] = useState(0); // Time minutes
```

### Sync with Parent

```typescript
// Value flows down
value={reminderAt}  // ISO string from parent

// Changes flow up
onChange={(isoString) => {
  setReminderAt(isoString);  // Update parent state
}}
```

## 🧪 User Flows

### Flow 1: Quick Preset Selection

1. Click input → Dropdown opens
2. Click "1 giờ nữa" preset
3. Time auto-calculated and applied
4. Dropdown closes
5. Display shows formatted time

### Flow 2: Custom Date Selection

1. Click input → Dropdown opens
2. Navigate to desired month (◀ ▶)
3. Click day in calendar
4. Adjust hours/minutes
5. Click "Xác nhận"
6. Dropdown closes
7. Value saved

### Flow 3: Clear Reminder

1. See filled input with [X] button
2. Click [X]
3. Value cleared
4. Display returns to placeholder

## 📐 Layout & Positioning

```
┌─────────────────────────────┐
│ Input Field (Button styled) │
│ ├─ Text display            │
│ └─ Clear button [X]        │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Absolute Positioned Dropdown│
│ (max-w-sm, z-50)           │
│                            │
│ ├─ Presets section         │
│ ├─ Calendar header         │
│ ├─ Calendar grid           │
│ ├─ Time picker             │
│ └─ Action buttons          │
└─────────────────────────────┘
```

## ⚡ Performance

### Optimizations

-   ✅ Click outside handled by single event listener
-   ✅ Calendar days generated only when dropdown open
-   ✅ No unnecessary re-renders
-   ✅ Efficient date calculations
-   ✅ Lazy state updates

### Bundle Size

-   **lucide-react icons**: Already in project
-   **No external date libraries**: Pure JS Date objects
-   **Minimal CSS**: Tailwind utility classes

## 🔮 Future Enhancements

### Potential Additions

1. **Time presets**: "Morning (9:00)", "Afternoon (14:00)", "Evening (18:00)"
2. **Recurring options**: Daily, Weekly, Monthly
3. **Multiple timezone support**
4. **Date range picker mode**
5. **Week view toggle**
6. **Keyboard navigation**: Arrow keys in calendar
7. **Custom preset configurations**
8. **Animation on open/close**

## 📱 Responsive Design

### Desktop (default)

-   Full dropdown with all features
-   Side-by-side preset buttons (2 columns)
-   Comfortable spacing

### Tablet & Mobile

-   Same features, adjusted widths
-   Touch-friendly button sizes
-   Proper spacing for fingers

## ✅ Accessibility

### Keyboard Support

-   Tab navigation through inputs
-   Number inputs with arrow keys
-   Enter to confirm
-   Escape to close (can be added)

### Screen Readers

-   Semantic HTML buttons
-   Clear labels
-   ARIA attributes (can be enhanced)

## 🎊 Comparison: Old vs New

| Feature         | Old (Native Input)    | New (Custom)                  |
| --------------- | --------------------- | ----------------------------- |
| UI              | Basic browser default | Beautiful custom design       |
| Presets         | ❌ None               | ✅ 4 quick options            |
| Calendar        | Browser dependent     | ✅ Consistent across browsers |
| Dark mode       | Limited               | ✅ Full support               |
| Visual feedback | Minimal               | ✅ Rich animations            |
| Mobile UX       | Varies by browser     | ✅ Consistent                 |
| Customization   | Limited               | ✅ Highly customizable        |
| Brand alignment | ❌ Generic            | ✅ Matches app design         |

## 🚀 Ready to Use!

The new DateTimePicker is now fully functional and integrated into:

-   ✅ CreateItemModal
-   ✅ All item creation/edit forms
-   ✅ Works with existing Item API
-   ✅ Timezone handling intact
-   ✅ No breaking changes

**Just update and enjoy the professional experience!** 🎉
