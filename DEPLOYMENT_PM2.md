# Frontend PM2 release deployment

Workflow chỉ chạy khi push lên `master` và commit mới nhất chứa `release v`.

```bash
git commit -m "release v1.0.0"
git push origin master
```

## Chuẩn bị server

```bash
npm install -g pm2
mkdir -p /var/www/dao-edu
cd /var/www/dao-edu
git clone https://github.com/tranhuunam00/FE-Dao-EDU.git
```

Tạo `/var/www/dao-edu/FE-Dao-EDU/.env.production`:

```env
VITE_API_URL=https://your-domain.example/api
```

Chạy lần đầu:

```bash
cd /var/www/dao-edu/FE-Dao-EDU
bash scripts/deploy-pm2.sh master
pm2 startup
pm2 save
```

Nên đặt Nginx/Caddy chuyển website tới `127.0.0.1:4173`.

## GitHub Actions secrets

Cấu hình các Secret trên GitHub Repository để chạy CI/CD tự động:

1. **Repository Secrets (Dùng chung cho cả 2 môi trường)**:
   Vào *Settings ➡️ Secrets and variables ➡️ Actions*, thêm các Repository secrets sau:
   - `SSH_HOST`: IP hoặc hostname server.
   - `SSH_PORT`: cổng SSH, thường là `22`.
   - `SSH_USER`: user deploy.
   - `SSH_PRIVATE_KEY`: private key của user deploy.
   - `SSH_KNOWN_HOSTS`: kết quả `ssh-keyscan -H server.example.com`.

2. **Environment Secrets (Tách biệt cho Dev và Production)**:
   Để tránh việc merge nhánh làm ghi đè thư mục deploy, chúng ta cấu hình `DEPLOY_PATH` theo từng Môi trường (Environment):
   - Vào *Settings ➡️ Environments*, tạo 2 môi trường: **`development`** và **`production`**.
   - Trong môi trường **`development`**: Thêm biến `DEPLOY_PATH` là đường dẫn của Dev (ví dụ: `/var/www/dao-edu/FE-Dao-EDU`).
   - Trong môi trường **`production`**: Thêm biến `DEPLOY_PATH` là đường dẫn của Production (ví dụ: `/root/master/FE-Dao-EDU` hoặc tương ứng).

Pipeline frontend hoàn toàn độc lập với backend. Push frontend không pull, build hay restart backend.

```bash
pm2 status
pm2 logs dao-edu-production-web
```
