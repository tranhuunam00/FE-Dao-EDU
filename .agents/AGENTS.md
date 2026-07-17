# FE-Dao-EDU - Agent Instructions & Rules

Chào mừng bạn (Agent) đến với dự án Frontend của DAO EDU. Dưới đây là các quy định và hướng dẫn chi tiết mà bạn bắt buộc phải tuân theo khi phát triển và bảo trì mã nguồn tại repo này.

---

## 1. QUY TẮC BẮT BUỘC (CRITICAL RULES)

*   **Quy tắc 500 dòng:** Một file code nguồn không được vượt quá **500 dòng**. Nếu file dài hơn, bạn bắt buộc phải tách nhỏ thành các component, layout, helper hoặc route độc lập.
*   **Quản lý phiên bản Git:** Cấm tự ý thực hiện `git commit` hoặc `git push` mã nguồn lên server. Chỉ chỉnh sửa, tối ưu hóa code và chạy các lệnh test/build tại local. Việc commit và push code sẽ do **USER** tự thực hiện.

---

## 2. QUY CHUẨN THIẾT KẾ UI/UX & RESPONSIVE

1.  **Thiết kế cao cấp (Premium Aesthetics):**
    *   Sử dụng bảng màu CSS variables động có sẵn (`var(--bg-primary)`, `var(--text-primary)`, `var(--card-bg)`) để giao diện tự động thích ứng với cả 2 chế độ Light Mode và Dark Mode.
    *   Tuyệt đối **không** được sử dụng mã màu cứng (hardcoded colors) như `#fff`, `#111827`, `#e5e7eb`... cho phần text hoặc background, tránh lỗi chữ mờ hoặc tàng hình khi đổi theme.
    *   Áp dụng kỹ năng `ui-ux-pro-max` và `ui-styling` để nâng cấp trải nghiệm người dùng.
2.  **Khả năng tương thích di động (Mobile Responsiveness):**
    *   Toàn bộ màn hình, bảng biểu (Tables), bộ lọc (Filters) và các khối thông tin (Grid/Cards) phải hiển thị tốt trên thiết bị di động (sử dụng breakpoint `@media (max-width: 767px)` trong `index.css`).
    *   Bảng biểu Antd Table trên mobile bắt buộc phải có scroll ngang và cỡ chữ nhỏ (`10.5px` cho body, `10px` cho header) để không bị vỡ.
    *   Các nhóm card thống kê hiển thị dạng grid 2 cột (`xs={12}`) thay vì chiếm dụng 1 dòng lớn.

---

## 3. TÍCH HỢP APIS & QUẢN LÝ ROUTING

1.  **Kết nối API:**
    *   Bắt buộc kết nối Backend qua Axios client dùng chung tại `src/services/api.ts`.
    *   Áp dụng kỹ năng `dao-edu-api-integration` để đảm bảo định nghĩa kiểu dữ liệu (TypeScript Interfaces) đồng bộ với Response/Request DTO từ Backend.
2.  **Quản lý Trang & Định tuyến:**
    *   Định nghĩa các route vai trò (Admin, Teacher, Student) trong `src/App.tsx`.
    *   Khi thiết kế màn hình, hãy chia nhỏ các tab hoặc phần tử phức tạp thành các file component con trong thư mục `components/` của từng trang. Áp dụng kỹ năng `dao-edu-react-pages`.

---

## 4. KỸ NĂNG CỤ THỂ ĐƯỢC PHÂN CHIA (FE SKILLS MAP)

Khi làm việc trong repo này, hãy chủ động tham khảo các kỹ năng tương ứng trong thư mục `.agents/skills/`:
*   `dao-edu-antd`: Cách tùy biến theme và custom CSS token cho Ant Design 5.
*   `dao-edu-api-integration`: Quy chuẩn kết nối API, xử lý lỗi token hết hạn và upload file.
*   `dao-edu-react-pages`: Thiết kế cấu trúc trang, layout phân vai, và tối ưu hóa React 19.
*   `ui-styling`: Các token màu sắc CSS variables, glassmorphism, và layout responsive.
*   `ui-ux-pro-max`: Quy chuẩn thiết kế giao diện, phối màu nghệ thuật, biểu đồ phân tích.
