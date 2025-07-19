# FB-UID Finder 🔍

Công cụ tìm kiếm Facebook User ID (UID) đơn giản và hiệu quả với giao diện web hiện đại.

## ✨ Tính năng

- 🎯 **Tìm UID từ URL hoặc username** - Hỗ trợ nhiều định dạng đầu vào
- 📱 **Responsive Design** - Hoạt động tốt trên mọi thiết bị  
- 🚀 **Xử lý hàng loạt** - Tìm kiếm nhiều profile cùng lúc
- 🔄 **Chiến lược fallback** - Thử multiple endpoints để tăng success rate
- 🐛 **Debug mode** - Lưu HTML response để troubleshoot
- 🇻🇳 **Giao diện tiếng Việt** - UI/UX thân thiện

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn

### Cách 1: Chạy trực tiếp
```bash
# Clone repository
git clone https://github.com/Quocker22/FB-UID.git
cd FB-UID

# Cài đặt dependencies
npm install

# Chạy server
npm start
# hoặc
node server.js
```

### Cách 2: Sử dụng Docker
```bash
# Build và chạy với docker-compose
docker-compose up -d

# Hoặc chỉ chạy API
docker build -t fb-uid .
docker run -p 3000:3000 fb-uid
```

## 💻 Sử dụng

### Web Interface
1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Nhập Facebook URL hoặc username vào ô text
3. Nhấn **"Mấy cu em hiện ra nào"** để tìm kiếm
4. Kết quả sẽ hiển thị link để join group Facebook

### Command Line Interface (CLI)
```bash
# Tìm UID từ username
node fetch_facebook_uid.js zuck

# Tìm UID từ URL đầy đủ
node fetch_facebook_uid.js "https://www.facebook.com/zuck"
```

### API Endpoint
```bash
# POST request đến /api/fetch-uid
curl -X POST http://localhost:3000/api/fetch-uid \
  -H "Content-Type: application/json" \
  -d '{"identifier": "zuck"}'
```

## 📋 Ví dụ

### Input formats được hỗ trợ:
```
zuck
https://www.facebook.com/zuck
https://www.facebook.com/profile.php?id=4
m.facebook.com/zuck
```

### Output mẫu:
```json
{
  "uid": "4",
  "success": true
}
```

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│   Express.js     │◄──►│ FacebookUID     │
│   (Frontend)    │    │   (API Server)   │    │ Fetcher Class   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │   Facebook.com   │
                        │   (External)     │
                        └──────────────────┘
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production         # Environment mode
```

### Customize target group
Trong file `web-interface/js/app.js`, tìm và thay đổi group ID:
```javascript
// Thay đổi group ID ở đây
const groupId = "1212236082236816";
```

## 🛠️ Development

### Project Structure
```
FB-UID/
├── server.js              # Express server
├── fetch_facebook_uid.js  # Core UID fetching logic
├── package.json           # Dependencies
├── Dockerfile            # Docker configuration
├── web-interface/        # Frontend files
│   ├── index.html       # Main HTML
│   ├── js/app.js        # Frontend logic
│   └── css/styles.css   # Custom styles
└── debug_*.html         # Debug files (auto-generated)
```

### Adding new regex patterns
Trong file `fetch_facebook_uid.js`, thêm pattern vào array `patterns`:
```javascript
const patterns = [
    // Existing patterns...
    /your-new-pattern-here/,
];
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## ⚠️ Lưu ý quan trọng

- **Sử dụng có trách nhiệm**: Tool này chỉ nên được sử dụng cho mục đích hợp pháp
- **Tuân thủ Terms of Service**: Respect Facebook's terms và user privacy
- **Rate limiting**: Tránh spam requests để không bị block
- **Debug files**: Files `debug_*.html` có thể chứa sensitive data

## 📝 License

ISC License - see LICENSE file for details

## 👨‍💻 Author

**Quoc** - [Facebook Profile](https://www.facebook.com/groups/1212236082236816/user/100011121390143)

---

<div align="center">
Made with ❤️ by Form Mixi
</div>