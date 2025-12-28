# Frontend Implementation - Reminder Feature

## 🎉 Completed Implementation

Tính năng lời nhắc đã được implement đầy đủ ở frontend với các components và UI đẹp mắt.

## ✅ Các thay đổi đã thực hiện

### 1. Types & API Client

#### Updated Files:

-   ✅ **types/item.types.ts** - Added `reminderAt?: string` to Item, CreateItemDto, and UpdateItemDto
-   ✅ **lib/api/endpoints/items.ts** - Added reminderAt handling in createItem and updateItem

### 2. New Components Created

#### DateTimePicker Component

📁 `components/ui/DateTimePicker.tsx`

**Features:**

-   Native HTML5 datetime-local input with custom styling
-   Automatic timezone conversion (local ↔ UTC)
-   Clear button to remove reminder
-   Min date validation (prevents past dates)
-   Dark mode support
-   Helpful hint text

**Props:**

```typescript
{
  value?: string | null;           // ISO 8601 datetime
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;                  // Default: new Date()
}
```

#### ReminderBadge Component

📁 `components/shared/ReminderBadge.tsx`

**Features:**

-   Color-coded badges based on reminder status:
    -   🔴 Red: Past reminders
    -   🟡 Yellow: Upcoming (within 24h)
    -   🔵 Blue: Future reminders
-   Relative time display (e.g., "trong 2 giờ")
-   Tooltip with absolute time
-   Uses date-fns for Vietnamese localization
-   Dark mode support

**Props:**

```typescript
{
  reminderAt: string;              // ISO 8601 datetime
  className?: string;
  showTime?: boolean;              // Show relative time text
}
```

### 3. Updated Components

#### CreateItemModal

📁 `components/library/CreateItemModal.tsx`

**Changes:**

-   Added `reminderAt` state
-   Import DateTimePicker component
-   Added DateTimePicker to form (after Tags section)
-   Pass reminderAt to create/update mutations
-   Reset reminderAt on form reset
-   Initialize reminderAt from editItem in edit mode

#### ItemCard

📁 `components/library/ItemCard.tsx`

**Changes:**

-   Import ReminderBadge
-   Display ReminderBadge between tags and meta info
-   Only shows when item has reminder

#### ItemListRow

📁 `components/library/ItemListRow.tsx`

**Changes:**

-   Import ReminderBadge
-   Display compact ReminderBadge (without time text)
-   Shows on medium+ screens
-   Positioned between tags and metadata

#### ItemDetailPanel

📁 `components/library/ItemDetailPanel.tsx`

**Changes:**

-   Import ReminderBadge
-   Added dedicated reminder section with gradient background
-   Shows both badge and formatted datetime
-   Positioned after Tags section

### 4. Dependencies Added

```json
{
    "date-fns": "^latest"
}
```

## 🎨 UI/UX Features

### DateTimePicker

-   **Clean Design**: Minimalist input with bell icon
-   **Easy Clear**: One-click button to remove reminder
-   **Validation**: Prevents selecting past dates
-   **Feedback**: Shows hint when reminder is set

### ReminderBadge

-   **Smart Colors**:
    -   Red for overdue (needs attention)
    -   Yellow for urgent (< 24h)
    -   Blue for scheduled
-   **Contextual Icons**: Bell for future, Clock for past
-   **Readable**: Vietnamese relative time format
-   **Tooltips**: Hover to see exact datetime

## 📖 Usage Examples

### Creating Item with Reminder

```typescript
// User selects datetime in DateTimePicker
// Component automatically converts to UTC
const formData = {
    type: "NOTE",
    title: "Team Meeting",
    content: "Discuss Q1 goals",
    reminderAt: "2025-12-31T10:00:00.000Z", // UTC
};

// API handles the rest
await itemsApi.createItem(formData);
```

### Updating Reminder

```typescript
// User changes reminder time
setReminderAt("2026-01-05T15:00:00.000Z");

// Or removes it
setReminderAt(null);
```

### Display Logic

```tsx
// ItemCard shows reminder badge
{
    item.reminderAt && <ReminderBadge reminderAt={item.reminderAt} />;
}

// ItemListRow shows compact version
{
    item.reminderAt && (
        <ReminderBadge
            reminderAt={item.reminderAt}
            showTime={false} // Icon only for list view
        />
    );
}
```

## 🔧 Technical Details

### Timezone Handling

DateTimePicker component handles timezone conversion:

```typescript
// Browser's local time → UTC for API
const toISOString = (localDateTime: string): string => {
    return new Date(localDateTime).toISOString();
};

// UTC from API → Browser's local time for display
const toLocalDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
};
```

### Relative Time Formatting

Using date-fns with Vietnamese locale:

```typescript
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const relativeTime = formatDistanceToNow(reminderDate, {
    addSuffix: true,
    locale: vi,
});
// Output: "trong 2 giờ", "3 ngày trước", etc.
```

## 🎯 User Flows

### 1. Set Reminder on New Item

1. Click "Create New Item"
2. Fill in title, content
3. Scroll to "Nhắc nhở" section
4. Click datetime picker
5. Select date and time
6. See confirmation hint
7. Click "Create Item"

### 2. Edit Existing Reminder

1. Click item to open detail panel
2. See current reminder (if set)
3. Click "Edit" button
4. Modal opens with reminder pre-filled
5. Change datetime or click 🔕 to remove
6. Click "Update Item"

### 3. View Reminders in Library

1. Items with reminders show badge
2. Color indicates urgency
3. Hover for exact datetime
4. Click item for full details

## 🎨 Color Scheme

```css
/* Past/Overdue */
bg-red-100 text-red-700 border-red-200
dark:bg-red-900/20 dark:text-red-400 dark:border-red-800

/* Upcoming (< 24h) */
bg-yellow-100 text-yellow-700 border-yellow-200
dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800

/* Future */
bg-blue-100 text-blue-700 border-blue-200
dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800
```

## ✨ Responsive Design

-   **Desktop**: Full badge with relative time
-   **Tablet**: Compact badge in list view
-   **Mobile**: Icon + time in card view

## 🚀 Performance

-   **No unnecessary re-renders**: Memoized date calculations
-   **Efficient updates**: Only re-calculates on mount or prop change
-   **Lazy loading**: date-fns only imported where needed

## 📝 Testing Checklist

-   [x] Create item with reminder
-   [x] Edit reminder time
-   [x] Remove reminder (set to null)
-   [x] View reminder badge in grid view
-   [x] View reminder badge in list view
-   [x] View reminder in detail panel
-   [x] Verify timezone conversion
-   [x] Test dark mode
-   [x] Test responsive layouts
-   [x] Verify color coding (past/upcoming/future)

## 🔮 Future Enhancements

1. **Quick Actions**

    - "Remind me in 1 hour" button
    - "Remind tomorrow at 9am" preset
    - "Snooze" functionality

2. **Calendar View**

    - Show all reminders in calendar
    - Drag to reschedule
    - Monthly overview

3. **Notifications**

    - Browser push notifications
    - Sound alerts
    - Desktop notifications

4. **Recurring Reminders**

    - Daily/Weekly/Monthly repeats
    - Custom recurrence patterns

5. **Smart Suggestions**
    - AI-suggested reminder times
    - Based on item type and content

## 📚 Files Changed

### Created (2 files):

1. `frontend/src/components/ui/DateTimePicker.tsx`
2. `frontend/src/components/shared/ReminderBadge.tsx`

### Modified (6 files):

1. `frontend/src/types/item.types.ts`
2. `frontend/src/lib/api/endpoints/items.ts`
3. `frontend/src/components/library/CreateItemModal.tsx`
4. `frontend/src/components/library/ItemCard.tsx`
5. `frontend/src/components/library/ItemListRow.tsx`
6. `frontend/src/components/library/ItemDetailPanel.tsx`

### Dependencies:

-   `date-fns` (new)

## 🎊 Ready to Use!

Tính năng reminder đã hoàn toàn sẵn sàng sử dụng! Người dùng có thể:

-   ⏰ Set reminder khi tạo item mới
-   ✏️ Chỉnh sửa reminder cho item đã có
-   🗑️ Xóa reminder
-   👀 Xem trạng thái reminder trong library
-   📧 Nhận email tự động từ backend khi đến giờ

All UI components are beautiful, responsive, and fully functional! 🚀
