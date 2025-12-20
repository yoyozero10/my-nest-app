# Hướng dẫn Seeding Data Users

## Tổng quan
Hệ thống đã được cấu hình để tự động seed dữ liệu users khi khởi động lần đầu tiên.

## Dữ liệu Users được seed

### 1. ADMIN Users (2 users)
- **admin@gmail.com**
  - Name: Admin System
  - Age: 30
  - Gender: Male
  - Address: Hà Nội, Việt Nam
  - Role: ADMIN

- **superadmin@gmail.com**
  - Name: Super Admin
  - Age: 35
  - Gender: Male
  - Address: Hồ Chí Minh, Việt Nam
  - Role: ADMIN

### 2. HR Users (3 users)
- **hr1@gmail.com**
  - Name: Nguyễn Văn HR
  - Age: 28
  - Gender: Male
  - Address: Đà Nẵng, Việt Nam
  - Role: HR

- **hr2@gmail.com**
  - Name: Trần Thị Hương
  - Age: 26
  - Gender: Female
  - Address: Hải Phòng, Việt Nam
  - Role: HR

- **hr.manager@gmail.com**
  - Name: Lê Minh Quản
  - Age: 32
  - Gender: Male
  - Address: Cần Thơ, Việt Nam
  - Role: HR

### 3. Normal Users (5 users)
- **user1@gmail.com**
  - Name: Phạm Văn An
  - Age: 24
  - Gender: Male
  - Address: Hà Nội, Việt Nam
  - Role: USER

- **user2@gmail.com**
  - Name: Hoàng Thị Bình
  - Age: 23
  - Gender: Female
  - Address: Hồ Chí Minh, Việt Nam
  - Role: USER

- **user3@gmail.com**
  - Name: Đỗ Minh Châu
  - Age: 25
  - Gender: Male
  - Address: Đà Nẵng, Việt Nam
  - Role: USER

- **user4@gmail.com**
  - Name: Vũ Thị Dung
  - Age: 22
  - Gender: Female
  - Address: Nha Trang, Việt Nam
  - Role: USER

- **user5@gmail.com**
  - Name: Bùi Văn Em
  - Age: 27
  - Gender: Male
  - Address: Huế, Việt Nam
  - Role: USER

## Thông tin đăng nhập

**Password mặc định cho TẤT CẢ users: `123456`**

## Cách sử dụng

### Đăng nhập với ADMIN
```
Email: admin@gmail.com
Password: 123456
```

### Đăng nhập với HR
```
Email: hr1@gmail.com
Password: 123456
```

### Đăng nhập với USER
```
Email: user1@gmail.com
Password: 123456
```

## Cơ chế hoạt động

1. Khi server NestJS khởi động, `DatabasesService` sẽ kiểm tra xem database đã có dữ liệu chưa
2. Nếu chưa có permissions nào (database mới), hệ thống sẽ tự động:
   - Tạo permissions
   - Tạo roles (ADMIN, HR, USER)
   - Tạo 10 users mẫu với các role khác nhau
3. Tất cả passwords đều được hash bằng bcrypt với salt rounds = 10

## Kiểm tra dữ liệu

### Sử dụng MongoDB Compass
1. Kết nối đến: `mongodb://localhost:27017`
2. Chọn database: `nest`
3. Xem collection: `users`

### Sử dụng API
```bash
# Login để lấy token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@gmail.com","password":"123456"}'

# Lấy danh sách users (cần token)
curl -X GET http://localhost:3000/api/v1/users?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Reset dữ liệu

Nếu muốn reset và seed lại dữ liệu:

1. Xóa toàn bộ database:
```bash
# Trong MongoDB shell
use nest
db.dropDatabase()
```

2. Restart server NestJS:
```bash
npm run start:dev
```

Server sẽ tự động seed lại toàn bộ dữ liệu.

## Logs

Khi seeding thành công, bạn sẽ thấy các log sau trong console:

```
[DatabasesService] >>> START INIT PERMISSIONS
[DatabasesService] >>> Created 35 permissions
[DatabasesService] >>> START INIT ROLES
[DatabasesService] >>> Created 3 roles
[DatabasesService] >>> START INIT USERS
[DatabasesService] >>> Created 10 users
[DatabasesService] >>> Default password for all users: 123456
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: Đây là dữ liệu mẫu cho môi trường development. 

Trong môi trường production:
- Không sử dụng password đơn giản như "123456"
- Tạo users với passwords mạnh và unique
- Xóa hoặc disable các tài khoản test
- Sử dụng biến môi trường để quản lý credentials
