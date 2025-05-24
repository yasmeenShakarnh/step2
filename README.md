# 📚 Learning Management System (LMS)

## 🚀 Project Overview
A full-featured educational platform built with Spring Boot for the backend and React.js for the frontend.  
This LMS allows user registration, course management, content delivery, assessments, and notifications.

## 🧩 Features Summary

### 👥 User Management
- Register/Login using JWT or Google OAuth2
- Role-based access: Admin, Instructor, Student
- Secure profile management

### 📚 Course Management
- Create, update, delete, and list courses
- Assign instructors to specific courses

### 📝 Assessment & Progress
- Create quizzes and assignments
- Auto-grade quizzes and manage submissions
- Track student scores and course completion

### 📦 Content Management
- Upload and download lectures (PDFs, videos, quizzes)
- Access based on user roles

### 🔔 Notification System
- Email/SMS alerts for course updates and deadlines

## 🧪 Technologies Used

| Backend                      | Frontend                        |
|-----------------------------|----------------------------------|
| Java 21+                    | React.js                        |
| Spring Boot + Spring Sec    | Material UI /Tailwind |
| Spring Data JPA             | Redux / Context API             |
| PostgreSQL                  | Axios for API calls             |
| Swagger / OpenAPI           | FontAwesome for Icons           |
| Maven                       | JWT-based Auth                  |

## ⚙️ Prerequisites

Make sure the following are installed:

- Java 21+
- PostgreSQL (running locally)
- Maven
- Node.js (for frontend setup)
- Postman or Swagger UI (optional for API testing)

## 📁 Project Structure

```
project-root/
├── 
│   └── step1/ (backend)
│       └── src/main/java/...
├── my-app/ (React)
│   └── src/...
```

## 🛠️ Backend Setup Instructions

1. Clone the repo:

```bash
git clone https://github.com/swer354/course-project-step-2-frontend-development-syr.git
```

2. Setup database in `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/Step1
    username: postgres
    password: 123
```

> ⚠️ Replace credentials as needed

3. Run the backend:

```bash
mvn spring-boot:run
```

4. Access API Documentation:

- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)  
- OpenAPI JSON: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

## 🎨 Frontend Setup Instructions

1. Navigate to frontend folder (once implemented):

```bash
cd my-app
```

2. Install dependencies:

```bash
npm install
```

3. Run the React app:

```bash
npm start
```

## 🧭 Frontend Functionality Guide

- **Login/Signup** — Access with JWT token management  
- **Dashboard** — Navbar, Sidebar, and Footer  
- **User CRUD** — Admin features for user management  
- **Responsive UI** — Works on mobile and desktop  
- **Secure Token Handling** — Store JWT in `localStorage`

## 📌 Project Status

| Stage           | Status     |
|------------------|------------|
| Monolithic API   | ✅ Completed |
| Frontend Dev     | ✅ Completed |
