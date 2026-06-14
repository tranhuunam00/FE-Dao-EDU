# Frontend PM2 release deployment

Workflow chỉ chạy khi push lên `main` và commit mới nhất chứa `release v`.

```bash
git commit -m "release v1.0.0"
git push origin main
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
bash scripts/deploy-pm2.sh main
pm2 startup
pm2 save
```

Nên đặt Nginx/Caddy chuyển website tới `127.0.0.1:4173`.

## GitHub Actions secrets

Thêm vào repository frontend:

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `SSH_KNOWN_HOSTS`
- `DEPLOY_PATH`: `/var/www/dao-edu/FE-Dao-EDU`

Pipeline frontend hoàn toàn độc lập với backend. Push frontend không pull, build
hay restart backend.

```bash
pm2 status
pm2 logs dao-edu-web
```
