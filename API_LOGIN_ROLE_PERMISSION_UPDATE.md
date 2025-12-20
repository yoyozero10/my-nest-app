# Cập nhật API Login - Trả về Role và Permissions

## Tổng quan
API login đã được cập nhật để trả về đầy đủ thông tin về **role** và **permissions** của user. Điều này giúp frontend có thể kiểm soát quyền truy cập và hiển thị UI phù hợp với từng role.

## Các thay đổi đã thực hiện

### 1. Cập nhật User Schema (`src/users/schemas/user.schema.ts`)
**Trước:**
```typescript
@Prop({ required: true, default: 'USER' })
role: string;
```

**Sau:**
```typescript
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
role: mongoose.Schema.Types.ObjectId;
```

**Lý do:** Thay đổi `role` từ string đơn giản sang ObjectId reference để có thể populate đầy đủ thông tin role và permissions.

---

### 2. Cập nhật IUser Interface (`src/users/users.interface.ts`)
**Sau khi cập nhật:**
```typescript
export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: {
        _id: string;
        name: string;
        permissions: {
            _id: string;
            name: string;
            apiPath: string;
            module: string;
            method: string;
        }[];
    };
    permissions?: {
        _id: string;
        name: string;
        apiPath: string;
        module: string;
        method: string;
    }[];
}
```

**Lý do:** Interface phản ánh đúng cấu trúc dữ liệu sau khi populate, với `role` chứa `permissions` bên trong.

---

### 3. Cập nhật UsersService (`src/users/users.service.ts`)

#### 3.1. Thêm RolesService dependency
```typescript
import { RolesService } from '../roles/roles.service';

constructor(
    @InjectModel(UserModel.name) private readonly userModel: SoftDeleteModelType<UserDocType>,
    private readonly rolesService: RolesService
) { }
```

#### 3.2. Cập nhật `findOneByEmail` method
```typescript
async findOneByEmail(email: string) {
    const user = await this.userModel
        .findOne({ email })
        .populate({
            path: 'role',
            populate: {
                path: 'permissions',
                select: '_id name apiPath module method'
            }
        })
        .lean();
    if (!user) {
        throw new NotFoundException('User not found');
    }
    return user;
}
```

**Lý do:** Populate role và permissions để trả về đầy đủ thông tin khi login.

#### 3.3. Cập nhật `findOne` method
Tương tự như `findOneByEmail`, thêm populate để hỗ trợ refresh token.

#### 3.4. Cập nhật `register` method
```typescript
async register(name: string, email: string, hashedPassword: string) {
    // Tìm role "USER" mặc định
    const userRole = await this.rolesService.findByName('USER');
    
    const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
        role: userRole?._id || null,
    });
    return user;
}
```

**Lý do:** Tìm và gán role "USER" mặc định từ database thay vì hardcode string.

---

### 4. Cập nhật RolesService (`src/roles/roles.service.ts`)

#### Thêm method `findByName`
```typescript
async findByName(name: string) {
    const role = await this.roleModel
        .findOne({ name })
        .populate({ path: 'permissions', select: 'name apiPath method' })
        .lean();

    return role;
}
```

**Lý do:** Hỗ trợ tìm role theo tên để gán role mặc định khi đăng ký.

---

### 5. Cập nhật AuthService (`src/auth/auth.service.ts`)

#### 5.1. Cập nhật `login` method
```typescript
async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
        sub: "token login",
        iss: "from server",
        _id,
        name,
        email,
        role
    };

    // ... (tạo tokens)

    return {
        response,
        access_token: this.jwtService.sign(accessTokenPayload),
        refreshToken,
        user: {
            _id,
            name,
            email,
            role,
            permissions: role?.permissions || []
        }
    };
}
```

**Thay đổi chính:**
- Trả về object `user` thay vì các field riêng lẻ
- Thêm `permissions` được lấy từ `role.permissions`

#### 5.2. Cập nhật `refreshToken` method
```typescript
const user = await this.usersService.findOne(payload._id) as any;

return {
    access_token: this.jwtService.sign(accessTokenPayload),
    user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.role?.permissions || []
    }
};
```

**Lý do:** Đảm bảo refresh token cũng trả về đầy đủ thông tin permissions.

---

### 6. Cập nhật UsersModule (`src/users/users.module.ts`)
```typescript
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        RolesModule
    ],
    // ...
})
```

**Lý do:** Import RolesModule để có thể sử dụng RolesService trong UsersService.

---

## Cấu trúc Response mới

### Login Response
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Admin System",
        "email": "admin@gmail.com",
        "role": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "ADMIN",
            "permissions": [
                {
                    "_id": "507f1f77bcf86cd799439013",
                    "name": "Create User",
                    "apiPath": "/api/v1/users",
                    "module": "USERS",
                    "method": "POST"
                },
                {
                    "_id": "507f1f77bcf86cd799439014",
                    "name": "Get Users",
                    "apiPath": "/api/v1/users",
                    "module": "USERS",
                    "method": "GET"
                }
                // ... more permissions
            ]
        },
        "permissions": [
            // Same as role.permissions
        ]
    }
}
```

### Refresh Token Response
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Admin System",
        "email": "admin@gmail.com",
        "role": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "ADMIN",
            "permissions": [...]
        },
        "permissions": [...]
    }
}
```

---

## Cách sử dụng trên Frontend

### 1. Lưu trữ thông tin user và permissions
```typescript
// Sau khi login thành công
const loginResponse = await api.login(email, password);

// Lưu vào localStorage hoặc state management
localStorage.setItem('access_token', loginResponse.access_token);
localStorage.setItem('user', JSON.stringify(loginResponse.user));
localStorage.setItem('permissions', JSON.stringify(loginResponse.user.permissions));
```

### 2. Kiểm tra quyền truy cập
```typescript
// Helper function để check permission
function hasPermission(apiPath: string, method: string): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.some(p => 
        p.apiPath === apiPath && p.method === method
    );
}

// Sử dụng
if (hasPermission('/api/v1/users', 'POST')) {
    // Hiển thị nút "Create User"
}

if (hasPermission('/api/v1/users', 'DELETE')) {
    // Hiển thị nút "Delete User"
}
```

### 3. Kiểm tra role
```typescript
function hasRole(roleName: string): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role?.name === roleName;
}

// Sử dụng
if (hasRole('ADMIN')) {
    // Hiển thị admin panel
}
```

### 4. Route Guard (React Router example)
```typescript
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredPermission }) {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    
    const hasAccess = permissions.some(p => 
        p.apiPath === requiredPermission.apiPath && 
        p.method === requiredPermission.method
    );
    
    if (!hasAccess) {
        return <Navigate to="/unauthorized" />;
    }
    
    return children;
}

// Sử dụng
<Route 
    path="/users/create" 
    element={
        <ProtectedRoute requiredPermission={{ apiPath: '/api/v1/users', method: 'POST' }}>
            <CreateUserPage />
        </ProtectedRoute>
    } 
/>
```

---

## Testing

### Test Login API
```bash
# Login với admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@gmail.com",
    "password": "123456"
  }'
```

**Expected Response:**
```json
{
    "access_token": "...",
    "user": {
        "_id": "...",
        "name": "Admin System",
        "email": "admin@gmail.com",
        "role": {
            "_id": "...",
            "name": "ADMIN",
            "permissions": [...]
        },
        "permissions": [...]
    }
}
```

### Test với các role khác
```bash
# Login với HR
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hr1@gmail.com",
    "password": "123456"
  }'

# Login với USER
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1@gmail.com",
    "password": "123456"
  }'
```

---

## Lưu ý quan trọng

### 1. Database Migration
Nếu database hiện tại đã có users với `role` là string, bạn cần:
1. Xóa database cũ: `db.dropDatabase()`
2. Restart server để tự động seed lại data với cấu trúc mới

### 2. Seeding Data
Hệ thống sẽ tự động tạo:
- **Permissions**: Tất cả các quyền cần thiết
- **Roles**: ADMIN, HR, USER với permissions tương ứng
- **Users**: 10 users mẫu với các role khác nhau

Xem chi tiết trong file `SEEDING_USERS_GUIDE.md`

### 3. Security
- Permissions được lưu trong JWT payload (trong `role` object)
- Frontend nên check permissions trước khi hiển thị UI
- Backend vẫn cần validate permissions cho mỗi API request
- Không nên tin tưởng hoàn toàn vào frontend validation

### 4. Performance
- Sử dụng `.lean()` để tăng performance khi query
- Populate chỉ select các fields cần thiết
- Cân nhắc cache permissions nếu có nhiều requests

---

## Troubleshooting

### Lỗi: "Property 'permissions' does not exist on type..."
**Nguyên nhân:** TypeScript không nhận ra populated data

**Giải pháp:** Đã cast sang `any` trong `refreshToken` method:
```typescript
const user = await this.usersService.findOne(payload._id) as any;
```

### Lỗi: User không có role sau khi register
**Nguyên nhân:** Role "USER" chưa tồn tại trong database

**Giải pháp:** 
1. Đảm bảo đã chạy seeding data
2. Hoặc tạo role "USER" thủ công trong database

### Permissions trống khi login
**Nguyên nhân:** Role chưa được gán permissions

**Giải pháp:** Kiểm tra trong database xem role đã có permissions chưa:
```javascript
db.roles.findOne({ name: "USER" })
```

---

## Tài liệu liên quan
- [SEEDING_USERS_GUIDE.md](./SEEDING_USERS_GUIDE.md) - Hướng dẫn về seeding data
- Role Schema: `src/roles/schemas/role.schema.ts`
- Permission Schema: `src/permissions/schemas/permission.schema.ts`
- User Schema: `src/users/schemas/user.schema.ts`
