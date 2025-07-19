# FB-UID Project Analysis

## Tổng quan dự án (Project Overview)

**FB-UID** là một công cụ tìm kiếm Facebook User ID (UID) được viết bằng Node.js với giao diện web hiện đại. Dự án hỗ trợ cả việc sử dụng qua dòng lệnh (CLI) và giao diện web.

## Kiến trúc hệ thống (System Architecture)

### Backend
- **Framework**: Express.js
- **Port**: 3000 (có thể cấu hình qua biến môi trường PORT)
- **Main files**:
  - `server.js` - Web server chính
  - `fetch_facebook_uid.js` - Logic core tìm kiếm UID

### Frontend  
- **Framework**: Vanilla JavaScript với Tailwind CSS và DaisyUI
- **Location**: `/web-interface/`
- **Features**: Responsive design, Vietnamese interface

### Containerization
- **Docker**: Dockerfile cho backend
- **Docker Compose**: Orchestration cho cả API và web interface
- **Nginx**: Reverse proxy cho production

## Tính năng chính (Main Features)

### 1. Tìm kiếm UID từ nhiều định dạng
- Facebook URL đầy đủ: `https://www.facebook.com/username`
- Username đơn giản: `username`
- Hỗ trợ xử lý hàng loạt (batch processing)

### 2. Chiến lược tìm kiếm thông minh
- Thử cả desktop (`www.facebook.com`) và mobile (`m.facebook.com`)
- Sử dụng User-Agent giả lập iPhone Safari
- Áp dụng nhiều regex pattern để trích xuất UID

### 3. Regex Patterns được sử dụng
```javascript
// Meta tags patterns
/content="fb:\/\/profile\/(\d+)"/
/content="fb:\/\/profile\/\?id=(\d+)/

// JSON patterns
/"userID":(\d+)/
/"user_id":(\d+)/
/"entity_id":(\d+)/
/"page_id":(\d+)/
/"profile_id":(\d+)/

// URL patterns
/facebook\.com\/profile\.php\?id=(\d+)/
/\/profile\/(\d+)/
```

## API Endpoints

### POST `/api/fetch-uid`
**Request Body:**
```json
{
  "identifier": "username_or_url"
}
```

**Response Success:**
```json
{
  "uid": "123456789",
  "success": true
}
```

**Response Error:**
```json
{
  "error": "Error message",
  "success": false
}
```

## Cách sử dụng (Usage)

### CLI Mode
```bash
node fetch_facebook_uid.js <facebook_url_or_username>
```

### Web Interface
1. Truy cập `http://localhost:3000`
2. Nhập Facebook URL hoặc username
3. Nhấn "Mấy cu em hiện ra nào" để tìm kiếm
4. Kết quả sẽ hiển thị link để join group Facebook cụ thể

### Docker
```bash
docker-compose up -d
```

## Cấu trúc thư mục (Directory Structure)

```
FB-UID/
├── server.js                 # Express server
├── fetch_facebook_uid.js     # Core UID fetching logic
├── package.json              # Node.js dependencies
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Multi-container setup
├── web-interface/           # Frontend application
│   ├── index.html          # Main HTML file
│   ├── js/app.js           # Frontend JavaScript
│   ├── css/styles.css      # Custom styles
│   └── package.json        # Frontend dependencies
└── debug_*.html            # Debug output files
```

## Dependencies

### Backend
- `express`: ^5.1.0 - Web framework
- `node-fetch`: ^3.3.2 - HTTP client

### Frontend
- Tailwind CSS - Utility-first CSS framework
- DaisyUI - Tailwind CSS components
- Font Awesome - Icons

## Tính năng đặc biệt (Special Features)

### 1. Debug Mode
- Tự động lưu HTML response vào `debug_*.html`
- Giúp troubleshoot khi không tìm thấy UID

### 2. Error Handling
- Graceful degradation khi một URL fail
- Thử multiple fallback URLs
- Clear error messages cho user

### 3. Vietnamese Interface
- Hoàn toàn bản địa hóa
- UI/UX thân thiện với người dùng Việt Nam
- Terminology phù hợp với cộng đồng Facebook Việt

### 4. Group Integration
- Kết quả trả về link trực tiếp để join group Facebook
- Format: `https://www.facebook.com/groups/1212236082236816/user/{uid}`

## Considerations & Limitations

### 1. Rate Limiting
- Không có built-in rate limiting
- Có thể bị Facebook block nếu request quá nhiều

### 2. Pattern Maintenance
- Facebook thường xuyên thay đổi HTML structure
- Cần update regex patterns định kỳ

### 3. Privacy & Ethics
- Tool này có thể được sử dụng cho mục đích tracking
- Cần sử dụng có trách nhiệm

### 4. Legal Compliance
- Cần tuân thủ Facebook Terms of Service
- Respect user privacy và data protection laws

## Recommendations for Improvement

### 1. Technical Enhancements
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 2. Error Handling
- Implement exponential backoff for retries
- Add circuit breaker pattern
- Better logging system

### 3. Configuration
- Environment-based configuration
- Configurable patterns and timeouts
- Multiple Facebook endpoint support

### 4. Security
- Input validation và sanitization
- CORS configuration
- Request logging và monitoring

### 5. Performance
- Caching mechanism
- Async processing for batch requests
- Database để store successful lookups

## Conclusion

FB-UID là một tool được thiết kế tốt với architecture rõ ràng và user experience tối ưu cho người dùng Việt Nam. Code clean, well-structured và có potential để scale lên production với một số improvements về security và performance.