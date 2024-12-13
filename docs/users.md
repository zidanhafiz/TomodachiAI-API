# Users API Spec
List of endpoints for user management.

- [Users API Spec](#users-api-spec)
  - [Register User](#register-user)
  - [Login User](#login-user)
  - [Refresh Token](#refresh-token)
  - [Get User](#get-user)
  - [Update User](#update-user)
  - [Delete User](#delete-user)
  - [List Users](#list-users)

## Register User

Endpoint:

```
POST /auth/signup
```

Request Body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "test@example.com",
  "password": "password"
}
```

Response:

```json
{
  "data": "Successfully registered user",
}
```

Error Response:

```json
{
  "error": "Failed to register user"
}
```

## Login User

Endpoint:

```
POST /auth/login
```

Request Body:

```json
{
  "email": "test@example.com",
  "password": "password"
}
```

Response:

```json
{
  "data": {
    "access_token": "1234567890",
    "refresh_token": "1234567890"
  }
}
```

- Access Token is valid for a day.
- Refresh Token is valid for 14 days.

Error Response:

```json
{
  "error": "Invalid credentials"
}
```

## Refresh Token

Endpoint:

```
POST /auth/refresh
```

Request Body:

```json
{
  "refresh_token": "1234567890"
}
```

Response:

```json
{
  "data": {
    "access_token": "1234567890"
  }
}
```

Error Response:

```json
{
  "error": "Failed to refresh token"
}
```

## Get User

User only can get their own information.

Endpoint:

```
GET /v1/users/:id
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "data": {
    "id": "123",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "refresh_token": "1234567890",
    "credits": 100,
    "created_at": "2021-01-01T00:00:00Z",
    "updated_at": "2021-01-01T00:00:00Z"
  }
}
```

Error Response:

```json
{
  "error": "Failed to get user"
}
```

## Update User

User only can update their own information.

Endpoint:

```
PATCH /v1/users/:id
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Request Body:

```json
{
  "first_name": "John",
  "last_name": "Doe"
}
```

Response:

```json
{
  "data": {
    "id": "123",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "credits": 100,
    "created_at": "2021-01-01T00:00:00Z",
    "updated_at": "2021-01-01T00:00:00Z"
  }
}
```

Error Response:

```json
{
  "error": "Failed to update user"
}
```

## Delete User

User only can delete their own account.

Endpoint:

```
DELETE /v1/users/:id
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Request Body:

```json
{
  "password": "password"
}
```

Response:

```json
{
  "data": "Successfully deleted user"
}
```

Error Response:

```json
{
  "error": "Failed to delete user"
}
```

## List Users

Only admin can list all users.

Endpoint:

```
GET /v1/users
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Query Params:

- name: string
- email: string
- role: string
- page: number
- limit: number

Response:

```json
{
  "data": [
    {
      "id": "123",
      "email": "test@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "credits": 100,
      "created_at": "2021-01-01T00:00:00Z",
      "updated_at": "2021-01-01T00:00:00Z"
    },
    {
      "id": "124",
      "email": "test2@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "user",
      "credits": 100,
      "created_at": "2021-01-01T00:00:00Z",
      "updated_at": "2021-01-01T00:00:00Z"
    }
  ],
  "current_page": 1,
  "total_pages": 10
}
```

Error Response:

```json
{
  "error": "Failed to list users"
}
```
