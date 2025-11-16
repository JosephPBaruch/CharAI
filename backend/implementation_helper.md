## API Endpoints

All endpoints start with `/api/auth/`

### 1. Register
**POST** `/api/auth/register/`

**Request:**
```json
{
  "username": "johndoe",
  "password": "securepass123",
  "password2": "securepass123",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "message": "User registered successfully"
}
```

### 2. Login
**POST** `/api/auth/login/`

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "message": "Login successful"
}
```

### 3. Get User Info
**GET** `/api/auth/user/`

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (401) - Not authenticated:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 4. Logout
**POST** `/api/auth/logout/`

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

## How It Works

1. **Database Storage**: Users stored in SQLite (`db.sqlite3`)
2. **Password Security**: Passwords are hashed using Django
3. **Dual Authentication**: 
   - **Token Auth**: For API requests (store in localStorage/cookies)
   - **Session Auth**: For session-based authentication
4. **Token Generation**: Each user gets a unique auth token on registration/login
- **SQLite Database**: `backend/db.sqlite3`


## DATABASE TABLES:

**Authentication & User Management:**
- `auth_user` - User accounts (Django's built-in User model)
- `authtoken_token` - API authentication tokens
- `django_session` - Session data for authenticated users
- `auth_group` - User groups for permissions
- `auth_permission` - Django permissions system

**Django System Tables:**
- `django_admin_log` - Admin panel activity tracking
- `django_content_type` - Content types metadata
- `django_migrations` - Migration history
