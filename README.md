# Counselling Launchpad Backend

A scalable, maintainable, and well-structured Node.js backend API built with TypeScript, Express, and MongoDB using a modular architecture pattern.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server startup and database connection
│   ├── config/                # Configuration files
│   │   ├── env.ts            # Environment variables configuration
│   │   ├── database.ts       # Database connection configuration
│   │   └── index.ts          # Configuration exports
│   ├── constants/             # Application constants
│   │   └── enums.ts          # Enums and constant values
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── validationMiddleware.ts  # Request validation
│   ├── modules/               # Feature modules (modular architecture)
│   │   ├── auth/             # Authentication module
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── models/       # Database models
│   │   │   ├── repositories/ # Data access layer
│   │   │   ├── routes/       # Route definitions
│   │   │   ├── services/     # Business logic
│   │   │   └── index.ts      # Module exports
│   │   └── index.ts          # All modules router
│   ├── types/                # TypeScript type definitions
│   │   └── global.d.ts       # Global types and interfaces
│   └── utils/                # Utility functions
│       ├── logger.ts         # Logging utility
│       └── response.ts       # API response utility
├── package.json
├── tsconfig.json             # TypeScript configuration
└── README.md
```

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with feature-based modules
- **TypeScript**: Full TypeScript support with strict configuration
- **Authentication**: Complete JWT-based authentication system with login/signup
- **Security**: Built-in security middleware (CORS, input sanitization)
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Validation**: Request validation with custom validation middleware
- **Logging**: Structured logging with different log levels
- **Database**: MongoDB with Mongoose ODM
- **API Design**: RESTful API with consistent response format

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/counselling_launchpad
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   BCRYPT_SALT_ROUNDS=12
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 🎓 University Data Upload

This project includes a production-ready script for bulk uploading university data to the database.

### Quick Upload

```bash
# macOS/Linux
./upload-universities.sh

# Windows
upload-universities.bat

# Or directly with Node.js/Bun
node data.js
# or
bun data.js
```

### Features

- ✅ **Batch Processing** - Uploads in controlled batches to prevent server overload
- ✅ **Error Handling** - Automatic retry logic with exponential backoff
- ✅ **Progress Tracking** - Real-time progress updates with detailed statistics
- ✅ **Resume Capability** - Automatically skips already uploaded universities
- ✅ **Rate Limiting** - Configurable delays to respect server limits

### Configuration

Edit the `CONFIG` section in `data.js`:

```javascript
const CONFIG = {
  API_URL: "http://localhost:5001/api/v1/auth/register",
  BATCH_SIZE: 5,              // Universities per batch
  DELAY_BETWEEN_REQUESTS: 1000, // Delay between each request (ms)
  DELAY_BETWEEN_BATCHES: 3000,  // Delay between batches (ms)
  MAX_RETRIES: 3,             // Retry attempts for failed uploads
};
```

### Documentation

- 📖 **Detailed Guide**: `UNIVERSITY_UPLOAD_GUIDE.md`
- 📋 **Quick Reference**: `QUICK_UPLOAD_REFERENCE.md`

For full documentation on uploading university data, configuration options, troubleshooting, and best practices, see the [University Upload Guide](UNIVERSITY_UPLOAD_GUIDE.md).

## 🔐 Authentication API Endpoints

### Public Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/refresh-tokens` - Refresh access tokens
- `GET /api/v1/auth/verify-email/:token` - Verify email address

### Protected Endpoints (Requires Authentication)

- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PATCH /api/v1/auth/profile` - Update user profile
- `PATCH /api/v1/auth/change-password` - Change password

### Health Check

- `GET /api/v1/health` - API health check

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  },
  "statusCode": 200
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "error": "Detailed error information (in development)"
}
```

## 🏛️ Architecture Patterns

### Modular Architecture

Each feature is organized as a module with its own:

- **Models**: Database schemas and models
- **Repositories**: Data access layer
- **Services**: Business logic layer
- **Controllers**: HTTP request handling
- **Routes**: Route definitions
- **Validators**: Input validation

### Layered Architecture

1. **Routes Layer**: HTTP routes and middleware
2. **Controller Layer**: Request/response handling
3. **Service Layer**: Business logic
4. **Repository Layer**: Data access
5. **Model Layer**: Database schemas

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Request rate limiting
- Error handling without information leakage

## 🗄️ Database

The application uses MongoDB with Mongoose ODM. The database connection is managed through a singleton pattern for efficient connection handling.

### User Model

- Name, email, password
- Role-based access (Admin, Counselor, Student)
- Email verification system
- Password reset functionality
- Refresh token management

## 🚦 Environment Configuration

The application supports different environments (development, production, test) with appropriate configurations for each.

## 📊 Logging

Structured logging with different levels:

- Error: System errors and exceptions
- Warn: Warning messages
- Info: General information
- Debug: Detailed debugging information (development only)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Update documentation
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

## 🎯 Next Steps

To enhance this backend further, consider:

1. **Adding more security packages** (helmet, express-rate-limit, etc.)
2. **Implementing email service** for verification and password reset
3. **Adding API documentation** with Swagger/OpenAPI
4. **Setting up automated testing** with Jest
5. **Adding database migrations**
6. **Implementing file upload functionality**
7. **Adding more user roles and permissions**
8. **Setting up monitoring and health checks**

## 📞 Support

For support and questions, please create an issue in the repository.
