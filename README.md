# Rafeeq

Rafeeq is split into two parts:

- `backend`: Spring Boot API + PostgreSQL
- `Frontend`: Expo / React Native app

Start the backend first, then start the frontend.

## Project Structure

- `backend` - Java Spring Boot backend
- `Frontend` - Expo / React Native frontend

## Prerequisites

Before running the project, make sure you have these installed on your PC:

- Git
- Java 17
- Node.js and npm
- PostgreSQL
- Android Studio emulator or Expo Go on a phone if you want to test the mobile app

## Quick Start

### 1. Clone the Project

```powershell
git clone <your-repo-url>
cd Rafeeq-Work
```

### 2. Run the Backend

Open a new PowerShell window:

```powershell
cd backend
```

Important notes:

- The backend runs on `http://localhost:8080` by default.
- Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.
- The backend uses `spring.jpa.hibernate.ddl-auto=validate`.
- This means PostgreSQL tables must already exist before the backend starts.
- There are no SQL migration/init files in the repository, so import the team database/schema dump first.

### Backend Default Values

If you do not set any environment variables, Spring Boot will use these defaults:

| Variable | Default value |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5433/rafeeq` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `123` |
| `JWT_SECRET` | built-in development default |
| `JWT_EXPIRATION` | `86400000` |
| `JWT_REFRESH_EXPIRATION` | `2592000000` |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://localhost:8080` |
| `PORT` | `8080` |

### Option A: Run With the Default Local Setup

Use this if your PostgreSQL setup matches the default values above:

```powershell
.\mvnw.cmd spring-boot:run
```

### Option B: Run With Custom Environment Variables

The file `backend/.env.example` is a reference file only. When you run the backend from the terminal, set the values as environment variables in PowerShell or in your IDE run configuration.

Example:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/rafeeq"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="your_base64_secret_at_least_32_bytes"
$env:JWT_EXPIRATION="86400000"
$env:JWT_REFRESH_EXPIRATION="2592000000"
$env:APP_CORS_ALLOWED_ORIGINS="http://localhost:8081,http://localhost:8080"
$env:PORT="8080"

.\mvnw.cmd spring-boot:run
```

### Backend Test Command

```powershell
.\mvnw.cmd test
```

### 3. Run the Frontend

Open another PowerShell window:

```powershell
cd Frontend
```

Create the frontend environment file:

```powershell
copy .env.example .env
```

Edit `Frontend/.env` and set:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

Use `http://localhost:8080` when running the frontend on the same PC.

Use `http://YOUR_PC_IP:8080` when opening the app from a physical phone with Expo Go.

Install dependencies and start the app:

```powershell
npm install
npm start
```

Useful frontend commands:

- `npm start` - starts Expo
- `npm run android` - opens Android emulator flow
- `npm run web` - runs the app in the browser
- `npm run ios` - works on macOS only

## Recommended Run Order

1. Make sure PostgreSQL is running.
2. Make sure the Rafeeq database schema/data already exists.
3. Start the backend from the `backend` folder.
4. Start the frontend from the `Frontend` folder.

## Development Notes

- Forgot-password OTP codes are printed in the backend console in development mode.
- If you change the backend port, also update `EXPO_PUBLIC_API_BASE_URL` in `Frontend/.env`.
- If you open the frontend in a browser on a different host/port, add that origin to `APP_CORS_ALLOWED_ORIGINS`.

## Troubleshooting

### Backend fails with table/relation errors

The database schema is missing. Import the correct PostgreSQL schema/data dump from the team before starting the backend.

### Frontend cannot connect to backend

- Make sure the backend is running first.
- Make sure `EXPO_PUBLIC_API_BASE_URL` points to the correct backend address.
- If you are using a real phone, use your PC's local IP instead of `localhost`.
- Make sure the phone and PC are on the same network.

### CORS error in the browser

Add the frontend URL to `APP_CORS_ALLOWED_ORIGINS` before starting the backend.

## Team Setup Checklist

Each team member should have:

- Java 17 installed
- Node.js and npm installed
- PostgreSQL installed and running
- The correct PostgreSQL schema/data imported
- `Frontend/.env` created and pointing to the correct backend URL
