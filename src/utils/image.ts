/**
 * Chuyển đổi các URL ảnh chứa IP và Port của MinIO về tên miền mới (imgeducare.home-care.vn)
 * @param url URL ảnh gốc từ backend
 * @returns URL ảnh mới sạch hơn chạy qua Nginx HTTPS
 */
export function cleanMinioUrl(url?: string | null): string {
  if (!url) return '';
  // Match any IP (e.g. 103.90.227.173), excluding loopback 127.0.0.1
  const ipRegex = /^https?:\/\/(?!(127\.0\.0\.1))(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?/i;
  const newDomain = 'https://imgeducare.home-care.vn';
  if (ipRegex.test(url)) {
    return url.replace(ipRegex, newDomain);
  }
  return url;
}
