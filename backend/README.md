# ShopKart Authentication Lab

## Run
1. Install Node.js 20+.
2. Start MongoDB.
3. Edit `.env` and set a strong `JWT_SECRET`.
4. Run:
   ```bash
   npm install
   npm start
   ```

## Endpoints

### Register
POST `http://localhost:5000/customers/register`

```json
{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "password": "john123",
  "phone": "9876543210"
}
```

### Login
POST `http://localhost:5000/customers/login`

```json
{
  "email": "john@gmail.com",
  "password": "john123"
}
```

The server sets the JWT in the `token` HttpOnly cookie.

### My Profile
GET `http://localhost:5000/customers/me`

The browser/Postman must send the login cookie.

### Logout
POST `http://localhost:5000/customers/logout`

### Bonus: Change Password
PATCH `http://localhost:5000/customers/change-password`

```json
{
  "oldPassword": "john123",
  "newPassword": "john456"
}
```

## Important
- Passwords are stored only as bcrypt hashes.
- Password is never returned by an API.
- Invalid login always returns the same `Invalid credentials` message.
- `/customers/me`, `/customers/logout`, and the bonus endpoint require authentication.
