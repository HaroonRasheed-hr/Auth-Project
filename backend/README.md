# Auth Backend

FastAPI backend for authentication system.

## Setup

1. Install PostgreSQL (if not already installed).

2. Create a database:
   ```
   createdb auth_db
   ```
   Or use pgAdmin to create a database named `auth_db`.

3. Update `.env` with your database credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost/auth_db
   SECRET_KEY=your-secret-key-here
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the server:
   ```
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`.

## Endpoints

- POST /api/signup - Register a new user
- POST /api/login - Login user
- GET /api/user/{user_id} - Get user info (protected)
- POST /api/forgot-password - Request password reset
- POST /api/reset-password - Reset password with token