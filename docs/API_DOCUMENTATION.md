# توثيق APIs المنصة الرقمية

## نظرة عامة

توفر المنصة مجموعة شاملة من APIs لإدارة جميع جوانب النظام بطريقة آمنة وفعالة. جميع APIs تستخدم REST والتصاميم الحديثة لضمان سهولة التكامل والاستخدام.

## المصادقة والأمان

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Response Format
جميع الاستجابات تتبع التنسيق التالي:
```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string
}
```

## 🔐 Authentication APIs

### تغيير كلمة المرور
```http
POST /api/auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### التحقق من المصادقة الثنائية
```http
POST /api/auth/verify-2fa
```

**Request Body:**
```json
{
  "secret": "string",
  "code": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2FA verified successfully",
  "backupCodes": ["CODE1", "CODE2", "..."]
}
```

### حذف الحساب
```http
DELETE /api/auth/delete-account
```

**Request Body:**
```json
{
  "password": "string",
  "confirmation": "حذف حسابي"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## 👥 Users API

### الحصول على قائمة المستخدمين
```http
GET /api/users
```

**Query Parameters:**
- `page` (optional): رقم الصفحة (افتراضي: 1)
- `limit` (optional): عدد النتائج لكل صفحة (افتراضي: 10)
- `search` (optional): نص البحث
- `role` (optional): فلترة حسب الدور
- `status` (optional): فلترة حسب الحالة
- `sortBy` (optional): ترتيب حسب الحقل (افتراضي: createdAt)
- `sortOrder` (optional): اتجاه الترتيب (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "email": "string",
        "fullName": "string",
        "roles": ["string"],
        "status": "active|inactive|suspended",
        "signalsCount": number,
        "successRate": number,
        "createdAt": "string",
        "metadata": {
          "country": "string",
          "timezone": "string",
          "language": "string"
        }
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

### إنشاء مستخدم جديد
```http
POST /api/users
```

**Request Body:**
```json
{
  "email": "string",
  "fullName": "string",
  "roles": ["string"],
  "status": "active|inactive|suspended",
  "country": "string",
  "timezone": "string",
  "language": "string",
  "phone": "string"
}
```

### تحديث مستخدم
```http
PUT /api/users/:id
```

### حذف مستخدم
```http
DELETE /api/users/:id
```

## 📊 Signals API

### الحصول على قائمة الإشارات
```http
GET /api/signals
```

**Query Parameters:**
- `symbol` (optional): زوج العملات
- `status` (optional): حالة الإشارة
- `limit` (optional): عدد النتائج (افتراضي: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "symbol": "string",
      "direction": "BUY|SELL",
      "entryPrice": number,
      "targetPrice": number,
      "stopLoss": number,
      "confidence": number,
      "riskLevel": "string",
      "timeframe": "string",
      "strategy": "string",
      "technicalAnalysis": {
        "rsi": number,
        "macd": "string",
        "support": number,
        "resistance": number
      },
      "reasoning": ["string"],
      "createdAt": "string"
    }
  ]
}
```

### إنشاء إشارة جديدة
```http
POST /api/signals
```

**Request Body:**
```json
{
  "symbol": "string",
  "direction": "BUY|SELL",
  "entryPrice": number,
  "confidence": number,
  "riskLevel": "low|medium|high",
  "timeframe": "1m|5m|15m|1h|4h|1d",
  "strategy": "technical|ai|sentiment|combined"
}
```

### تحديث إشارة
```http
PUT /api/signals/:id
```

### حذف إشارة
```http
DELETE /api/signals/:id
```

## 📈 Analytics API

### الحصول على بيانات التحليلات
```http
GET /api/analytics
```

**Query Parameters:**
- `timeRange` (optional): الفترة الزمنية (7d|30d|90d|1y)
- `userId` (optional): معرف المستخدم لفلترة البيانات

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSignals": number,
    "successRate": number,
    "totalProfit": number,
    "activeUsers": number,
    "performanceData": [
      {
        "month": "string",
        "signals": number,
        "success": number
      }
    ],
    "distributionData": [
      {
        "name": "string",
        "value": number,
        "color": "string"
      }
    ],
    "topPerformers": [
      {
        "symbol": "string",
        "signalsCount": number,
        "successRate": number,
        "avgProfit": number,
        "status": "string"
      }
    ]
  }
}
```

## 🔔 Notifications API

### الحصول على قائمة الإشعارات
```http
GET /api/notifications
```

**Query Parameters:**
- `type` (optional): نوع الإشعار (signal|system|account|admin)
- `isRead` (optional): حالة القراءة (true|false)
- `isImportant` (optional): أهمية الإشعار (true|false)
- `limit` (optional): عدد النتائج (افتراضي: 50)
- `offset` (optional): إزاحة النتائج (افتراضي: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "signal|system|account|admin",
        "title": "string",
        "message": "string",
        "isRead": boolean,
        "isImportant": boolean,
        "createdAt": "string",
        "metadata": {
          "signalId": "string",
          "userId": "string",
          "actionUrl": "string"
        }
      }
    ],
    "total": number,
    "unread": number
  }
}
```

### إنشاء إشعار جديد
```http
POST /api/notifications
```

**Request Body:**
```json
{
  "type": "signal|system|account|admin",
  "title": "string",
  "message": "string",
  "isImportant": boolean,
  "metadata": {
    "signalId": "string",
    "actionUrl": "string"
  }
}
```

### تحديث إشعار
```http
PUT /api/notifications/:id
```

**Request Body:**
```json
{
  "isRead": boolean,
  "isImportant": boolean
}
```

### حذف إشعار
```http
DELETE /api/notifications/:id
```

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - بيانات غير صحيحة |
| 401  | Unauthorized - مصادقة مطلوبة |
| 403  | Forbidden - غير مصرح بالوصول |
| 404  | Not Found - المورد غير موجود |
| 405  | Method Not Allowed - طريقة غير مسموحة |
| 500  | Internal Server Error - خطأ في الخادم |

## 🔒 Security Notes

1. جميع APIs تتطلب مصادقة باستثناء endpoints المصادقة العامة
2. Rate limiting مطبق على جميع endpoints
3. جميع البيانات الحساسة مشفرة
4. Audit logging مفعل لجميع العمليات الحساسة
5. CORS مكون بشكل صحيح للأمان

## 📝 Usage Examples

### JavaScript/TypeScript
```typescript
// إعداد العميل
const apiClient = {
  baseURL: 'https://your-api-domain.com',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

// الحصول على الإشارات
const getSignals = async () => {
  const response = await fetch(`${apiClient.baseURL}/api/signals`, {
    headers: apiClient.headers
  });
  return response.json();
};

// إنشاء إشارة جديدة
const createSignal = async (signalData) => {
  const response = await fetch(`${apiClient.baseURL}/api/signals`, {
    method: 'POST',
    headers: apiClient.headers,
    body: JSON.stringify(signalData)
  });
  return response.json();
};
```

### cURL Examples
```bash
# الحصول على المستخدمين
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-api-domain.com/api/users

# إنشاء إشعار جديد
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"إشعار جديد","message":"رسالة الإشعار","type":"system"}' \
     https://your-api-domain.com/api/notifications
```

---

**آخر تحديث**: ديسمبر 2024  
**الإصدار**: 1.0.0  
**الحالة**: مكتمل ومختبر