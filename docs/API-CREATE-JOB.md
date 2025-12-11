# 🚀 API Tạo mới Job (Create a Job)

## Tổng quan
API này cho phép tạo mới một Job (công việc tuyển dụng) trong hệ thống. Thông tin người tạo (`createdBy`) sẽ được tự động lấy từ JWT token.

## Endpoint
```
POST /api/v1/jobs
```

## Authentication
⚠️ **Yêu cầu xác thực**: API này yêu cầu JWT token trong header

### Header
```
Authorization: Bearer <your_jwt_token>
```

## Request Body

### Cấu trúc JSON
```json
{
  "name": "Tuyển NestJS công ty Product Nhật Bản",
  "skills": ["Node.JS", "Nest.JS", "MongoDB"],
  "company": {
    "_id": "647b65a7464dc26d92730e4c",
    "name": "Hội Dân IT"
  },
  "salary": 15000000,
  "quantity": 10,
  "level": "FRESHER",
  "description": "JUST A DATE",
  "startDate": "2023-01-26T13:51:50.417-07:00",
  "endDate": "2023-01-27T13:51:50.417-07:00",
  "isActive": true
}
```

### Mô tả các trường

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|--------|-------------|----------|-------|
| `name` | String | ✅ | Tên công việc |
| `skills` | Array[String] | ✅ | Danh sách kỹ năng yêu cầu |
| `company._id` | String | ✅ | ID của công ty |
| `company.name` | String | ✅ | Tên công ty |
| `salary` | Number | ✅ | Mức lương (VNĐ), phải ≥ 0 |
| `quantity` | Number | ✅ | Số lượng tuyển dụng, phải ≥ 1 |
| `level` | String | ✅ | Cấp độ: `INTERN`, `FRESHER`, `JUNIOR`, `MIDDLE`, `SENIOR` |
| `description` | String | ✅ | Mô tả công việc |
| `startDate` | String (ISO 8601) | ✅ | Ngày bắt đầu tuyển dụng |
| `endDate` | String (ISO 8601) | ✅ | Ngày kết thúc tuyển dụng |
| `isActive` | Boolean | ✅ | Trạng thái hoạt động |

### Validation Rules

#### name
- Không được để trống
- Phải là chuỗi (string)

#### skills
- Không được để trống
- Phải là mảng (array)
- Mỗi phần tử trong mảng phải là chuỗi (string)

#### company
- Không được để trống
- Phải là object với 2 trường:
  - `_id`: ID của công ty (string, không được trống)
  - `name`: Tên công ty (string, không được trống)

#### salary
- Không được để trống
- Phải là số (number)
- Giá trị phải ≥ 0

#### quantity
- Không được để trống
- Phải là số (number)
- Giá trị phải ≥ 1

#### level
- Không được để trống
- Phải là một trong các giá trị: `INTERN`, `FRESHER`, `JUNIOR`, `MIDDLE`, `SENIOR`

#### description
- Không được để trống
- Phải là chuỗi (string)

#### startDate & endDate
- Không được để trống
- Phải là định dạng ngày hợp lệ theo chuẩn ISO 8601
- Ví dụ: `2023-01-26T13:51:50.417-07:00`

#### isActive
- Phải là boolean (`true` hoặc `false`)

## Response

### Success Response (201 Created)

```json
{
  "statusCode": 201,
  "message": "Create a new job",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-12-11T07:34:00.000Z"
  },
  "path": "/api/v1/jobs",
  "timestamp": "2024-12-11T07:34:00.123Z"
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "Tên job không được để trống",
    "Skills không được để trống",
    "Level phải là một trong các giá trị: INTERN, FRESHER, JUNIOR, MIDDLE, SENIOR"
  ],
  "error": "Bad Request"
}
```

#### 401 Unauthorized - Missing or Invalid Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Ví dụ sử dụng

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Tuyển NestJS công ty Product Nhật Bản",
    "skills": ["Node.JS", "Nest.JS", "MongoDB"],
    "company": {
      "_id": "647b65a7464dc26d92730e4c",
      "name": "Hội Dân IT"
    },
    "salary": 15000000,
    "quantity": 10,
    "level": "FRESHER",
    "description": "JUST A DATE",
    "startDate": "2023-01-26T13:51:50.417-07:00",
    "endDate": "2023-01-27T13:51:50.417-07:00",
    "isActive": true
  }'
```

### JavaScript (Fetch API)
```javascript
const createJob = async () => {
  const token = 'your_jwt_token_here';
  
  const response = await fetch('http://localhost:3000/api/v1/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Tuyển NestJS công ty Product Nhật Bản",
      skills: ["Node.JS", "Nest.JS", "MongoDB"],
      company: {
        _id: "647b65a7464dc26d92730e4c",
        name: "Hội Dân IT"
      },
      salary: 15000000,
      quantity: 10,
      level: "FRESHER",
      description: "JUST A DATE",
      startDate: "2023-01-26T13:51:50.417-07:00",
      endDate: "2023-01-27T13:51:50.417-07:00",
      isActive: true
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

### Axios
```javascript
import axios from 'axios';

const createJob = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/jobs',
      {
        name: "Tuyển NestJS công ty Product Nhật Bản",
        skills: ["Node.JS", "Nest.JS", "MongoDB"],
        company: {
          _id: "647b65a7464dc26d92730e4c",
          name: "Hội Dân IT"
        },
        salary: 15000000,
        quantity: 10,
        level: "FRESHER",
        description: "JUST A DATE",
        startDate: "2023-01-26T13:51:50.417-07:00",
        endDate: "2023-01-27T13:51:50.417-07:00",
        isActive: true
      },
      {
        headers: {
          'Authorization': `Bearer ${your_token}`
        }
      }
    );
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

## Lưu ý quan trọng

1. **JWT Token**: Bạn phải có JWT token hợp lệ để sử dụng API này. Token được lấy từ API login/register.

2. **Auto-populate createdBy**: Trường `createdBy` sẽ được tự động điền từ thông tin user trong JWT token, bạn không cần gửi trường này trong request body.

3. **Date Format**: Ngày tháng phải theo chuẩn ISO 8601. Bạn có thể sử dụng:
   ```javascript
   new Date().toISOString() // "2024-12-11T07:34:00.123Z"
   ```

4. **Level Values**: Chỉ chấp nhận các giá trị: `INTERN`, `FRESHER`, `JUNIOR`, `MIDDLE`, `SENIOR` (viết hoa).

5. **Company ID**: Đảm bảo `company._id` là ID hợp lệ của một công ty đã tồn tại trong hệ thống.

## Testing với Postman

1. Tạo một request mới với method `POST`
2. URL: `http://localhost:3000/api/v1/jobs`
3. Trong tab **Headers**, thêm:
   - Key: `Authorization`
   - Value: `Bearer <your_jwt_token>`
4. Trong tab **Body**, chọn `raw` và `JSON`, sau đó paste JSON mẫu ở trên
5. Click **Send**

## Các bước tiếp theo

Sau khi tạo job thành công, bạn có thể:
- Lấy danh sách jobs: `GET /api/v1/jobs`
- Xem chi tiết job: `GET /api/v1/jobs/:id`
- Cập nhật job: `PATCH /api/v1/jobs/:id`
- Xóa job: `DELETE /api/v1/jobs/:id`
