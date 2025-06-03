# 🛡️ NestJS Role-Based User & Document Management System

A scalable backend system built using **NestJS** that supports:

- Role-based user access control
- Dynamic permissions per module (CRUD-based)
- File upload and document management
- Admin auto-initialization with full access

---

## 🚀 Project Initialization

### 1. **Clone the Repository**

```bash
git clone https://github.com/Manik-Rangar/user-doc.git
cd  user-doc
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Configure Environment**

Create a `.env` file in the root folder. Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
JWT_ALGORITHM=HS256
JWT_EXPIRY=1d
JWT_ISSUER=nestjs-app
JWT_SECRET=your_jwt_secret
```

> Ensure the DB is set up and reachable before running the app.

---

## 😾 Start the Application

```bash
npm run start:dev
```

---

## 🧹 Features

### ✅ **Auto Admin and Role Setup**

- On first run, the system automatically:

  - Creates a default **Admin** user.
  - Creates a default **Admin** role with **full permissions** across all modules.
  - Permissions format: `"1111"` (Create, Read, Update, Delete).

### ✅ **Role-Based Access Control**

- A `User` is assigned a `Role`.
- Each `Role` defines **module-wise permissions** like:

  ```json
  {
    "USER": "1111", // Full access
    "DOCUMENT": "1011" // Create, no read, update, delete
  }
  ```

- Operations are protected by guards and permission decorators:

  - `GET` → Read
  - `POST` → Create
  - `PUT` → Update
  - `DELETE` → Delete

### ✅ **User Module**

- Create, read, update, delete users.
- Only admins can manage users.
- Users are validated for uniqueness on email.

### ✅ **Role Module**

- Create and manage roles.
- Assign module permissions with CRUD flags.

### ✅ **Document Module**

- Upload documents using `multer`.
- Supports full CRUD for file management.

---

## 🏗️ Project Structure

```
src/
├── auth/               # Authentication logic
├── user/               # User controller & service
├── role/               # Role controller & service
├── documents/          # Document management
├── shared/
│   ├── dtos/           # Data Transfer Objects
│   ├── guards/         # Role/Permission guards
│   └── database/       # DB configuration and models
```

---

## 📦 Tech Stack

- **NestJS** (Modular, DI, scalable architecture)
- **Sequelize** ORM with PostgreSQL
- **JWT** for authentication and authorization
- **Multer** for handling file uploads
- **Swagger** (Optional: Add decorators for auto API docs)

---

## 📌 Branches

- Only one active branch: `main`

---
