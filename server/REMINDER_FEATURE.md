# Tính năng Lời Nhắc (Reminder)

## Tổng quan

Tính năng lời nhắc cho phép người dùng đặt thời gian nhắc nhở cho các item (File, Link, Note). Khi đến thời gian hẹn, hệ thống sẽ tự động gửi email nhắc nhở cho người dùng.

## Kiến trúc

### 1. Database Schema

- Thêm trường `reminderAt` (DateTime?) vào model `Item`
- Có index để tối ưu query tìm kiếm reminder

### 2. Services

#### ReminderService

- **Scheduled Job**: Chạy mỗi 5 phút để kiểm tra reminder sắp đến
- **Logic**:
  - Tìm các item có `reminderAt` trong 5 phút tới
  - Chỉ xử lý items chưa bị trash (`isTrashed = false`)
  - Gửi email cho user
  - Sau khi gửi xong, set `reminderAt = null` để tránh gửi lại

#### ItemsService

- Hỗ trợ set `reminderAt` khi tạo item mới (CREATE)
- Hỗ trợ update `reminderAt` (UPDATE)
- Set `reminderAt = null` để xóa reminder

## API Endpoints

### 1. Tạo Item với Reminder

```bash
POST /api/items
Content-Type: multipart/form-data

{
  "type": "NOTE",
  "title": "Họp team",
  "content": "Họp review sprint",
  "reminderAt": "2025-12-31T10:00:00.000Z"  // ISO 8601 format
}
```

### 2. Cập nhật Reminder

```bash
PATCH /api/items/:id
Content-Type: application/json

{
  "reminderAt": "2025-12-31T15:00:00.000Z"
}
```

### 3. Xóa Reminder

```bash
PATCH /api/items/:id
Content-Type: application/json

{
  "reminderAt": null
}
```

### 4. Test Reminder (Manual Send)

```bash
POST /api/items/:id/send-reminder
```

Endpoint này để test, sẽ gửi email ngay lập tức cho item có id tương ứng.

## Email Template

Email nhắc nhở bao gồm:

- Tiêu đề item
- Mô tả (nếu có)
- Nội dung (đối với NOTE, hiển thị 200 ký tự đầu)
- URL (đối với LINK)
- Loại item (File/Link/Ghi chú)
- Link để xem chi tiết item

## Cấu hình

### Environment Variables

Đảm bảo các biến môi trường mail đã được cấu hình trong `.env`:

```env
# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### Scheduled Job

Job được cấu hình chạy mỗi 5 phút:

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
```

Có thể thay đổi tần suất bằng cách sửa trong `reminder.service.ts`:

- `CronExpression.EVERY_MINUTE` - Mỗi phút
- `CronExpression.EVERY_5_MINUTES` - Mỗi 5 phút
- `CronExpression.EVERY_10_MINUTES` - Mỗi 10 phút
- `CronExpression.EVERY_HOUR` - Mỗi giờ

## Ví dụ sử dụng

### 1. Tạo reminder cho link quan trọng

```typescript
// Frontend code
const createLinkWithReminder = async () => {
  const formData = new FormData();
  formData.append('type', 'LINK');
  formData.append('title', 'Deadline nộp báo cáo');
  formData.append('url', 'https://docs.google.com/...');
  formData.append('description', 'Báo cáo tuần này');

  // Set reminder 1 giờ trước deadline
  const reminderTime = new Date('2025-12-31T09:00:00');
  formData.append('reminderAt', reminderTime.toISOString());

  await fetch('/api/items', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
```

### 2. Dời reminder sang ngày khác

```typescript
const rescheduleReminder = async (itemId: string) => {
  const newTime = new Date('2026-01-05T10:00:00');

  await fetch(`/api/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reminderAt: newTime.toISOString(),
    }),
  });
};
```

### 3. Hủy reminder

```typescript
const cancelReminder = async (itemId: string) => {
  await fetch(`/api/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reminderAt: null,
    }),
  });
};
```

## Lưu ý khi triển khai

1. **Timezone**:
   - Backend lưu trữ theo UTC
   - Frontend cần convert sang UTC khi gửi lên server
   - Email hiển thị theo timezone của server

2. **Email Delivery**:
   - Cần cấu hình SMTP đúng
   - Với Gmail, cần sử dụng App Password
   - Kiểm tra email có bị vào spam không

3. **Performance**:
   - Index trên `reminderAt` giúp query nhanh
   - Job chỉ query items trong 5 phút tới
   - Sau khi gửi, set `reminderAt = null` để không query lại

4. **Error Handling**:
   - Nếu gửi email thất bại, log error nhưng không crash service
   - Có thể thêm retry mechanism nếu cần

## Mở rộng trong tương lai

1. **Multiple Reminders**: Cho phép nhiều lời nhắc cho một item
2. **Recurring Reminders**: Reminder lặp lại (hàng ngày, hàng tuần)
3. **SMS/Push Notification**: Ngoài email, gửi qua SMS hoặc push notification
4. **Snooze**: Cho phép hoãn reminder
5. **Custom Template**: Cho phép user tùy chỉnh nội dung email
6. **Reminder History**: Lưu lại lịch sử các reminder đã gửi

## Testing

### Unit Tests

```typescript
describe('ReminderService', () => {
  it('should send email for items with upcoming reminder', async () => {
    // Test logic
  });

  it('should clear reminderAt after sending', async () => {
    // Test logic
  });

  it('should not send reminder for trashed items', async () => {
    // Test logic
  });
});
```

### Manual Testing

1. Tạo item với `reminderAt` trong 5 phút tới
2. Đợi job chạy (mỗi 5 phút)
3. Kiểm tra email
4. Verify `reminderAt` đã được set về null

Hoặc dùng endpoint test:

```bash
curl -X POST http://localhost:3000/api/items/:id/send-reminder \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Không nhận được email?

1. Kiểm tra cấu hình SMTP trong `.env`
2. Kiểm tra user có email không (trong database)
3. Xem logs của server để tìm error
4. Kiểm tra email spam folder

### Reminder không được gửi đúng giờ?

1. Job chạy mỗi 5 phút, có thể chậm tới 5 phút
2. Kiểm tra timezone của server và database
3. Verify `reminderAt` đã được set đúng trong database

### Nhận nhiều email cho cùng một reminder?

1. Kiểm tra xem job có chạy nhiều lần không
2. Verify `reminderAt` được set về null sau khi gửi
3. Kiểm tra multiple instances của server đang chạy

## Logs

Service ghi logs cho các hoạt động chính:

- `🔔 Checking for pending reminders...` - Bắt đầu check
- `Found X reminder(s) to process` - Số lượng reminder tìm thấy
- `✅ Sent reminder for item X to email@example.com` - Gửi thành công
- `❌ Failed to send reminder for item X` - Gửi thất bại

Có thể xem logs để debug và monitor hệ thống.
