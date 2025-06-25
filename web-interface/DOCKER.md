# Docker Setup cho Cobalt Web Interface

## 📋 Tổng quan

Dự án này đã được cấu hình để chạy với Docker và Docker Compose, hỗ trợ cả môi trường development và production.

## 🏗️ Cấu trúc Docker

- **Dockerfile**: Multi-stage build với 2 target:
  - `development`: Chạy với Vite dev server (hot reload)
  - `production`: Build static files và serve với Nginx
- **docker-compose.yml**: Cấu hình các service
- **nginx.conf**: Cấu hình Nginx cho production
- **proxy.conf**: Cấu hình reverse proxy (tùy chọn)

## 🚀 Cách sử dụng

### 1. Production (Khuyên dùng)

Chạy ứng dụng production với Nginx:

```bash
# Build và chạy
docker-compose up -d

# Hoặc rebuild nếu có thay đổi
docker-compose up --build -d
```

**Truy cập**: http://localhost

### 2. Development

Chạy ứng dụng development với hot reload:

```bash
# Chạy development mode
docker-compose --profile dev up -d

# Xem logs
docker-compose logs -f cobalt-web-dev
```

**Truy cập**: http://localhost:5173

### 3. Với Reverse Proxy

Chạy với Nginx reverse proxy (port 8080):

```bash
# Chạy cả production và proxy
docker-compose --profile proxy up -d
```

**Truy cập**: http://localhost:8080

## 🛠️ Các lệnh hữu ích

```bash
# Xem status các container
docker-compose ps

# Xem logs
docker-compose logs -f

# Stop tất cả services
docker-compose down

# Stop và xóa volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Chỉ chạy service cụ thể
docker-compose up cobalt-web

# Exec vào container
docker-compose exec cobalt-web sh
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` để cấu hình:

```env
# API Configuration
API_URL=https://upload.thtmmo.com/
NODE_ENV=production

# Port Configuration
WEB_PORT=80
DEV_PORT=5173
PROXY_PORT=8080
```

### Customization

1. **Thay đổi port**: Sửa trong `docker-compose.yml`
2. **Cấu hình Nginx**: Sửa `nginx.conf`
3. **Cấu hình API**: Sửa trong `js/config.js`

## 📊 Monitoring

### Health Check

```bash
# Kiểm tra health
curl http://localhost/health

# Hoặc với Docker
docker-compose exec cobalt-web curl http://localhost/health
```

### Logs

```bash
# Xem logs realtime
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f cobalt-web

# Xem logs với timestamp
docker-compose logs -f -t
```

## 🔒 Security

Nginx đã được cấu hình với:

- Security headers
- Gzip compression
- Static file caching
- Request rate limiting
- Directory traversal protection

## 🧹 Cleanup

```bash
# Dọn dẹp containers và images
docker-compose down --rmi all -v

# Dọn dẹp system
docker system prune -a

# Xóa chỉ images của project
docker rmi $(docker images "*cobalt*" -q)
```

## 🐛 Troubleshooting

### Container không start

```bash
# Kiểm tra logs
docker-compose logs

# Kiểm tra container status
docker-compose ps

# Rebuild từ đầu
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port đã được sử dụng

```bash
# Tìm process đang dùng port
lsof -i :80

# Hoặc thay đổi port trong docker-compose.yml
ports:
  - "8080:80"  # Thay vì 80:80
```

### Volume mount issues (Development)

```bash
# Trên macOS/Windows, đảm bảo Docker có quyền truy cập folder
# Settings > Resources > File Sharing

# Hoặc thay đổi volume mapping
volumes:
  - .:/app:cached  # Thêm :cached cho performance
```

## 📝 Scripts tự động

Tạo file `scripts/docker.sh`:

```bash
#!/bin/bash

case $1 in
  "dev")
    docker-compose --profile dev up -d
    ;;
  "prod")
    docker-compose up -d
    ;;
  "stop")
    docker-compose down
    ;;
  "rebuild")
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    ;;
  *)
    echo "Usage: ./docker.sh [dev|prod|stop|rebuild]"
    ;;
esac
```

Cấp quyền và sử dụng:

```bash
chmod +x scripts/docker.sh
./scripts/docker.sh prod
```
