# 📚 Tài Liệu API - NestJS Application

## 📋 Mục Lục
- [Thông Tin Chung](#thông-tin-chung)
- [Authentication APIs](#authentication-apis)
- [User APIs](#user-apis)
- [Company APIs](#company-apis)
- [Error Responses](#error-responses)
- [TypeScript Types](#typescript-types)
- [Code Examples](#code-examples)

---

## Thông Tin Chung

**Base URL**: `http://localhost:3000/api`  
**API Version**: `v1` hoặc `v2`  
**Authentication**: JWT Bearer Token (trừ các endpoint Public)  
**Content-Type**: `application/json`

### Authentication Header
```
Authorization: Bearer <access_token>
```

### CORS Configuration
- **Origin**: Cho phép tất cả origins
- **Methods**: GET, HEAD, PUT, PATCH, POST, DELETE
- **Credentials**: true (hỗ trợ cookies)

---

## Authentication APIs

### 1. Đăng Ký Tài Khoản
**POST** `/api/auth/register` 🔓 Public

Tạo tài khoản người dùng mới.

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "age": 25,
  "gender": "Nam",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Validation:**
- `name`: string, required
- `email`: email hợp lệ, required
- `password`: string, required
- `age`: number >= 1, optional
- `gender`: string, optional
- `address`: string, optional

**Response 201:**
```json
{
  "message": "Register a new user",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "age": 25,
    "gender": "Nam",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Đăng Nhập
**POST** `/api/auth/login` 🔓 Public

Đăng nhập và nhận access token + refresh token (cookie).

**Request Body:**
```json
{
  "username": "nguyenvana@example.com",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "statusCode": 201,
  "message": "User Login",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com"
    }
  }
}
```

**Cookies:** Tự động set `refreshToken` (httpOnly, maxAge: 7 days)

---

### 3. Lấy Thông Tin Tài Khoản
**GET** `/api/auth/account` 🔒 Protected

Lấy thông tin user hiện tại từ JWT token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "User Information",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "role": "USER"
    }
  }
}
```

---

### 4. Refresh Token
**GET** `/api/auth/refresh` 🔓 Public

Làm mới access token bằng refresh token từ cookie.

**Cookies Required:**
```
refreshToken=<refresh_token>
```

**Response 201:**
```json
{
  "statusCode": 201,
  "message": "Refresh Token Success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com"
    }
  }
}
```

---

### 5. Đăng Xuất
**POST** `/api/auth/logout` 🔒 Protected

Đăng xuất và xóa refresh token.

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "User Logout",
  "data": null
}
```

---

## User APIs

### 1. Tạo User Mới
**POST** `/api/users` 🔒 Protected

Tạo user mới (yêu cầu quyền ADMIN).

**Request Body:**
```json
{
  "name": "Trần Thị B",
  "email": "tranthib@example.com",
  "password": "password123",
  "age": 30,
  "gender": "Nữ",
  "address": "456 Đường XYZ, Quận 2, TP.HCM",
  "role": "USER",
  "company": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Công ty ABC"
  }
}
```

**Validation:**
- `name`: string, required
- `email`: email hợp lệ, required
- `password`: string, required
- `age`: number >= 0, optional
- `gender`: string, optional
- `address`: string, optional
- `role`: "USER" hoặc "ADMIN", required
- `company`: object với _id và name, required

**Response 201:**
```json
{
  "message": "Create a new User",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Trần Thị B",
    "email": "tranthib@example.com",
    "age": 30,
    "gender": "Nữ",
    "address": "456 Đường XYZ, Quận 2, TP.HCM",
    "role": "USER",
    "company": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Công ty ABC"
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Lấy Danh Sách Users
**GET** `/api/users` 🔒 Protected

Lấy danh sách users với phân trang.

**Query Parameters:**
- `current`: number (default: 1) - Trang hiện tại
- `pageSize`: number (default: 10) - Số items mỗi trang

**Example:**
```
GET /api/users?current=1&pageSize=10
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Fetch user with paginate",
  "data": {
    "meta": {
      "current": 1,
      "pageSize": 10,
      "pages": 5,
      "total": 50
    },
    "result": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "age": 25,
        "gender": "Nam",
        "address": "123 Đường ABC, Quận 1, TP.HCM",
        "role": "USER",
        "company": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Công ty ABC"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Lấy User Theo ID
**GET** `/api/users/:id` 🔒 Protected

Lấy thông tin chi tiết của một user.

**Example:**
```
GET /api/users/507f1f77bcf86cd799439011
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Fetch user by id",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "age": 25,
    "gender": "Nam",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "role": "USER",
    "company": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Công ty ABC"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Cập Nhật User
**PATCH** `/api/users` 🔒 Protected

Cập nhật thông tin user (không thể cập nhật password).

**Request Body:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Nguyễn Văn A (Updated)",
  "email": "nguyenvana.updated@example.com",
  "age": 26,
  "gender": "Nam",
  "address": "789 Đường DEF, Quận 3, TP.HCM",
  "role": "ADMIN",
  "company": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Công ty ABC"
  }
}
```

**Validation:**
- `_id`: MongoDB ObjectId, required
- Các field khác: optional
- **Không thể cập nhật**: `password`, `createdBy`, `createdAt`

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Update a User",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nguyễn Văn A (Updated)",
    "email": "nguyenvana.updated@example.com",
    "age": 26,
    "gender": "Nam",
    "address": "789 Đường DEF, Quận 3, TP.HCM",
    "role": "ADMIN",
    "company": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Công ty ABC"
    },
    "updatedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com"
    },
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### 5. Xóa User
**DELETE** `/api/users/:id` 🔒 Protected

Xóa user (soft delete).

**Example:**
```
DELETE /api/users/507f1f77bcf86cd799439011
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Delete a User",
  "data": {
    "deleted": true
  }
}
```

---

## Company APIs

### 1. Tạo Company Mới
**POST** `/api/companies` 🔒 Protected

Tạo công ty mới.

**Request Body:**
```json
{
  "name": "Công ty TNHH ABC",
  "description": "Công ty chuyên về phát triển phần mềm",
  "address": "123 Đường Lê Lợi, Quận 1, TP.HCM"
}
```

**Validation:**
- `name`: string, required
- `description`: string, required
- `address`: string, required

**Response 201:**
```json
{
  "statusCode": 201,
  "message": "Create a new Company",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Công ty TNHH ABC",
    "description": "Công ty chuyên về phát triển phần mềm",
    "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Lấy Danh Sách Companies
**GET** `/api/companies` 🔒 Protected

Lấy danh sách companies với phân trang và tìm kiếm.

**Query Parameters:**
- `current`: number (default: 1) - Trang hiện tại
- `pageSize`: number (default: 10) - Số items mỗi trang
- `search`: string - Tìm kiếm chung (name, address, description)
- `name`: string - Lọc theo tên
- `address`: string - Lọc theo địa chỉ
- `description`: string - Lọc theo mô tả

**Examples:**
```
GET /api/companies?current=1&pageSize=10
GET /api/companies?search=ABC
GET /api/companies?name=Công ty ABC&address=Quận 1
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Fetch companies with paginate",
  "data": {
    "meta": {
      "current": 1,
      "pageSize": 10,
      "pages": 3,
      "total": 25
    },
    "result": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Công ty TNHH ABC",
        "description": "Công ty chuyên về phát triển phần mềm",
        "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Lấy Company Theo ID
**GET** `/api/companies/:id` 🔒 Protected

Lấy thông tin chi tiết của một công ty.

**Example:**
```
GET /api/companies/507f1f77bcf86cd799439012
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Fetch company by id",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Công ty TNHH ABC",
    "description": "Công ty chuyên về phát triển phần mềm",
    "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Cập Nhật Company
**PATCH** `/api/companies` 🔒 Protected

Cập nhật thông tin công ty.

**Request Body:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Công ty TNHH ABC (Updated)",
  "description": "Công ty chuyên về phát triển phần mềm và AI",
  "address": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM"
}
```

**Validation:**
- `_id`: MongoDB ObjectId, required
- Các field khác: optional

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Update a Company",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Công ty TNHH ABC (Updated)",
    "description": "Công ty chuyên về phát triển phần mềm và AI",
    "address": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    "updatedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com"
    },
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### 5. Xóa Company
**DELETE** `/api/companies/:id` 🔒 Protected

Xóa công ty (soft delete).

**Example:**
```
DELETE /api/companies/507f1f77bcf86cd799439012
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Delete a Company",
  "data": {
    "deleted": true
  }
}
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "Email must be a valid email address",
    "Password is required"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## TypeScript Types

### Interfaces Cơ Bản

```typescript
// User Interface
interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  company: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Company Interface
interface Company {
  _id: string;
  name: string;
  description: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// API Response
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Paginated Response
interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  };
}
```

### DTOs (Data Transfer Objects)

```typescript
// Register DTO
interface RegisterDto {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  address?: string;
}

// Login DTO
interface LoginDto {
  username: string; // email
  password: string;
}

// Create User DTO
interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  company: {
    _id: string;
    name: string;
  };
}

// Update User DTO
interface UpdateUserDto {
  _id: string;
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
  role?: 'USER' | 'ADMIN';
  company?: {
    _id: string;
    name: string;
  };
}

// Create Company DTO
interface CreateCompanyDto {
  name: string;
  description: string;
  address: string;
}

// Update Company DTO
interface UpdateCompanyDto {
  _id: string;
  name?: string;
  description?: string;
  address?: string;
}
```

---

## Code Examples

### Setup Axios Client

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // Quan trọng cho cookies
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data } = await axios.get(
          'http://localhost:3000/api/auth/refresh',
          { withCredentials: true }
        );
        
        const newToken = data.data.access_token;
        localStorage.setItem('access_token', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Authentication Flow

```typescript
import api from './api';

// Register
const register = async (data: RegisterDto) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Login
const login = async (credentials: LoginDto) => {
  const response = await api.post('/auth/login', credentials);
  const { access_token, user } = response.data.data;
  
  // Save token
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return response.data;
};

// Get Account
const getAccount = async () => {
  const response = await api.get('/auth/account');
  return response.data;
};

// Logout
const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};
```

### User Management

```typescript
// Get Users with Pagination
const getUsers = async (page: number = 1, pageSize: number = 10) => {
  const response = await api.get('/users', {
    params: { current: page, pageSize }
  });
  return response.data;
};

// Get User by ID
const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create User
const createUser = async (data: CreateUserDto) => {
  const response = await api.post('/users', data);
  return response.data;
};

// Update User
const updateUser = async (data: UpdateUserDto) => {
  const response = await api.patch('/users', data);
  return response.data;
};

// Delete User
const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
```

### Company Management

```typescript
// Get Companies with Search
const getCompanies = async (params?: {
  current?: number;
  pageSize?: number;
  search?: string;
  name?: string;
  address?: string;
}) => {
  const response = await api.get('/companies', { params });
  return response.data;
};

// Get Company by ID
const getCompanyById = async (id: string) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

// Create Company
const createCompany = async (data: CreateCompanyDto) => {
  const response = await api.post('/companies', data);
  return response.data;
};

// Update Company
const updateCompany = async (data: UpdateCompanyDto) => {
  const response = await api.patch('/companies', data);
  return response.data;
};

// Delete Company
const deleteCompany = async (id: string) => {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
};
```

### React Query Hooks

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Get Users
export const useUsers = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => getUsers(page, pageSize),
  });
};

// Create User
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Update User
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Delete User
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### React Component Example

```typescript
import React, { useState } from 'react';
import { useUsers, useDeleteUser } from './hooks/useUsers';

const UserList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading, error } = useUsers(page, pageSize);
  const deleteUser = useDeleteUser();
  
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa user này?')) {
      await deleteUser.mutateAsync(id);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Danh Sách Users</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.data.result.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleDelete(user._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {data.data.meta.pages}</span>
        <button 
          onClick={() => setPage(p => Math.min(data.data.meta.pages, p + 1))}
          disabled={page === data.data.meta.pages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserList;
```

---

## 📝 Tổng Kết

### Tổng Số Endpoints: 15

**Authentication (5)**:
- POST `/api/auth/register` 🔓
- POST `/api/auth/login` 🔓
- GET `/api/auth/account` 🔒
- GET `/api/auth/refresh` 🔓
- POST `/api/auth/logout` 🔒

**Users (5)**:
- POST `/api/users` 🔒
- GET `/api/users` 🔒
- GET `/api/users/:id` 🔒
- PATCH `/api/users` 🔒
- DELETE `/api/users/:id` 🔒

**Companies (5)**:
- POST `/api/companies` 🔒
- GET `/api/companies` 🔒
- GET `/api/companies/:id` 🔒
- PATCH `/api/companies` 🔒
- DELETE `/api/companies/:id` 🔒

### Features
✅ JWT Authentication  
✅ Refresh Token (cookie-based)  
✅ Pagination  
✅ Search & Filter  
✅ Soft Delete  
✅ CORS enabled  
✅ Validation  
✅ Error handling  

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-11  
**Base URL**: `http://localhost:3000/api`
