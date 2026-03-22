# Employee Expense Reimbursement

Employee Expense Reimbursement is a full-stack web application for submitting, reviewing, and managing employee expense claims. It includes role-based access for employees, managers, and super admins, supports receipt uploads, and provides approval workflows with comments and email notifications.

## What This Project Does

- Employees can register, log in, submit expenses, attach receipts, edit pending requests, and track review history.
- Managers can review only the expenses of employees assigned to them, approve or reject requests, and leave comments.
- Super admins can manage staff from the staff directory, assign or remove managers, promote employees to managers, demote managers back to employees, and delete users.
- The dashboard summarizes visible expenses by status and amount based on the logged-in user’s role.

## Highlights

- JWT authentication with refresh tokens
- Role-based access control
- Custom Django user model
- Expense approval and rejection workflow
- Receipt upload support
- Optional S3-backed media storage
- Redis-backed dashboard caching
- Email notification hook for approval and rejection
- Responsive React dashboard UI

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Axios

### Backend

- Django 5
- Django REST Framework
- Simple JWT
- PostgreSQL
- Redis
- boto3 + django-storages

## Project Structure

```text
Employee-Expense-Reimbursement/
├── backend/
│   ├── accounts/     # authentication, roles, staff directory
│   ├── expenses/     # expense APIs, dashboard, approval workflow
│   └── config/       # Django settings and root urls
└── frontend/
    └── src/          # React pages, layout, API client, auth context
```

## Core Workflows

### Employee

- Register and sign in
- Submit an expense with title, description, amount, category, and receipt
- Edit or delete pending expenses
- View approval comments and final outcome

### Manager

- View only assigned team members' expenses
- Filter dashboard cards by status
- Approve or reject an expense with a mandatory comment
- Review pending submissions from the manager dashboard or pending approvals page

### Super Admin

- View the full staff directory
- Open a three-dot action menu for a user
- Assign or remove a manager from an employee
- Change a user between employee and manager role
- Delete users

## API Overview

Base URL locally: `http://127.0.0.1:8000`

### Auth and Staff

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `GET /api/auth/staff-directory/`
- `GET /api/auth/managers/`
- `POST /api/auth/employees/<id>/assign-manager/`
- `PATCH /api/auth/employees/<id>/`
- `DELETE /api/auth/employees/<id>/`

### Expenses

- `GET /api/expenses/`
- `POST /api/expenses/`
- `GET /api/expenses/<id>/`
- `PUT /api/expenses/<id>/`
- `DELETE /api/expenses/<id>/`
- `GET /api/expenses/pending/`
- `POST /api/expenses/<id>/approve/`
- `POST /api/expenses/<id>/reject/`
- `POST /api/expenses/<id>/comment/`
- `GET /api/dashboard/`

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Employee-Expense-Reimbursement
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Update `.env` with your local PostgreSQL credentials.

Then run:

```bash
DEBUG=True python manage.py migrate
DEBUG=True python manage.py createsuperuser
DEBUG=True python manage.py runserver
```

Backend runs on `http://127.0.0.1:8000`

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://127.0.0.1:5173`

## Environment Variables

Example variables are provided in `backend/.env.example`.

Common ones:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `REDIS_URL`
- `CORS_ALLOWED_ORIGINS`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`
- `AWS_S3_REGION_NAME`
- `EMAIL_BACKEND`
- `DEFAULT_FROM_EMAIL`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `EMAIL_USE_TLS`

## Notes

- For local development, email notifications default to Django's console email backend, so approval and rejection emails are printed in the backend terminal.
- If S3 credentials are not provided, Django serves uploaded files from local media storage during development.
- Redis is used for dashboard caching, but the app is designed to continue working in local development if Redis is unavailable.

## Why This Project Matters

This project demonstrates:

- building a custom authentication system in Django
- designing role-based workflows across frontend and backend
- handling relational data between employees and managers
- integrating caching, file uploads, and email notifications
- creating a polished multi-role dashboard experience in React

## Future Improvements

- real-time notifications
- audit logs for admin actions
- search and filtering in the staff directory
- deployment configuration for cloud hosting
- automated tests for approval and staff-management flows
