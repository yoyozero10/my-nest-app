# Tóm tắt API hiện có

## AuthController (`/auth`) – @src/auth/auth.controller.ts
| Phương thức | Đường dẫn | Bảo vệ | Mô tả ngắn |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Đăng ký user mới, trả về thông tin user. |
| `POST` | `/auth/login` | Public + LocalAuthGuard | Đăng nhập, trả về access token, set refresh token cookie. |
| `GET` | `/auth/account` | JWT | Lấy thông tin tài khoản từ token. |
| `GET` | `/auth/refresh` | Public | Dùng refresh token từ cookie để cấp mới access token. |
| `POST` | `/auth/logout` | JWT | Xoá refresh token và cookie, đăng xuất. |

## UsersController (`/users`) – @src/users/users.controller.ts
| Phương thức | Đường dẫn | Bảo vệ | Mô tả ngắn |
| --- | --- | --- | --- |
| `POST` | `/users` | JWT | Tạo user mới; sử dụng `@User` để ghi nhận người thao tác. |
| `GET` | `/users` | JWT | Phân trang danh sách user qua query `current`, `pageSize`. |
| `GET` | `/users/:id` | JWT | Lấy chi tiết user theo ID. |
| `PATCH` | `/users` | JWT | Cập nhật user dựa trên `UpdateUserDto`. |
| `DELETE` | `/users/:id` | JWT | Xoá user theo ID, trả về `{ deleted: true }`. |

## CompaniesController (`/companies`) – @src/companies/companies.controller.ts
| Phương thức | Đường dẫn | Bảo vệ | Mô tả ngắn |
| --- | --- | --- | --- |
| `POST` | `/companies` | JWT | Tạo công ty mới với thông tin người thao tác. |
| `GET` | `/companies` | JWT | Phân trang + lọc công ty bằng các query `current`, `pageSize`, `search`, `name`, `address`, `description`. |
| `GET` | `/companies/:id` | JWT | Lấy chi tiết công ty theo ID. |
| `PATCH` | `/companies` | JWT | Cập nhật công ty qua `UpdateCompanyDto`. |
| `DELETE` | `/companies/:id` | JWT | Xoá công ty theo ID. |

---

**Tổng cộng:** 15 endpoint (5 Auth, 5 Users, 5 Companies).  
**Base URL:** `http://localhost:8000/api/v1`
