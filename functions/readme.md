# Notes App Backend

A robust Node.js backend API built with Express.js, TypeScript, and MongoDB for a comprehensive notes management application with advanced authentication features.

## 🚀 Features

### Authentication & Security
- **Dual Authentication**: Password-based and OTP-based login options
- **Multi-Channel OTP**: Email and SMS verification via Twilio
- **JWT Token Management**: Secure token-based authentication
- **Password Security**: Bcrypt encryption with salt rounds
- **Account Verification**: Email/SMS verification for new accounts
- **Password Reset**: Secure token-based password recovery
- **Rate Limiting**: Protection against registration spam attempts

### User Management
- **User Registration**: Complete signup with validation
- **Profile Management**: User details and preferences
- **Age Verification**: Minimum age requirement (13+)
- **Account Cleanup**: Automated removal of unverified accounts

### Notes Management
- **CRUD Operations**: Create, Read, Update, Delete notes
- **User Isolation**: Notes are user-specific and secure
- **Authorization**: Protected routes with JWT middleware

### Infrastructure
- **Database**: MongoDB with Mongoose ODM
- **Email Service**: Nodemailer for email notifications
- **SMS Service**: Twilio for SMS notifications
- **Error Handling**: Comprehensive error management system
- **Logging**: Morgan for request logging
- **Security**: Helmet.js for security headers

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (NeonDB)
- **ORM**: Mongoose
- **Authentication**: JWT + Passport
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Bcrypt, Helmet
- **Validation**: Custom validators

## 📦 Dependencies

```json
{
  "express": "Web framework",
  "typescript": "Type safety",
  "mongoose": "MongoDB ODM",
  "bcrypt": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "nodemailer": "Email service",
  "twilio": "SMS service",
  "helmet": "Security middleware",
  "cors": "Cross-origin requests",
  "cookie-parser": "Cookie parsing",
  "compression": "Response compression",
  "morgan": "HTTP logging",
  "node-cron": "Task scheduling",
  "crypto": "Cryptographic utilities",
  "uuid": "Unique identifiers",
  "validator": "Input validation"
}
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Twilio account for SMS
- Email service (SMTP)

### Installation

1. **Clone and Navigate**
```bash
git clone https://github.com/YogeshKumar-saini/Highway-Delite-notes-taking-app.git
cd functions
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
COOKIE_EXPIRE=7

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

4. **Start Development Server**
```bash
npm run dev
```

## 📁 Project Structure

```
functions/
├── src/
│   ├── controllers/          # Route handlers
│   │   ├── userController.ts
│   │   ├── noteController.ts
│   │   └── indexController.ts
│   ├── models/              # Database models
│   │   ├── userModels.ts
│   │   └── noteModel.ts
│   ├── routes/              # API routes
│   │   ├── userRoutes.ts
│   │   ├── noteRoutes.ts
│   │   └── indexRoute.ts
│   ├── middleware/          # Custom middleware
│   │   ├── auth.ts
│   │   ├── error.ts
│   │   └── catchAsyncError.ts
│   ├── utils/               # Utility functions
│   │   ├── errorHandler.ts
│   │   ├── sendEmail.ts
│   │   ├── sendToken.ts
│   │   └── validation utilities
│   ├── database/            # Database configuration
│   │   └── dvconnection.ts
│   ├── automation/          # Scheduled tasks
│   │   └── removeunverifyaccount.ts
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication Routes
```
POST /api/v1/user/register           # User registration
POST /api/v1/user/verify-otp         # OTP verification
POST /api/v1/user/login              # User login (password/OTP)
POST /api/v1/user/login/otp          # Request OTP for login
GET  /api/v1/user/logout             # User logout
GET  /api/v1/user/me                 # Get current user
POST /api/v1/user/password/forgot    # Forgot password
PUT  /api/v1/user/password/reset/:token # Reset password
```

### Notes Routes
```
POST /api/v1/user/notes              # Create note
GET  /api/v1/user/notes              # Get all user notes
GET  /api/v1/user/notes/:id          # Get specific note
PUT  /api/v1/user/notes/:id          # Update note
DELETE /api/v1/user/notes/:id        # Delete note
```

## 🔄 Authentication Flow

### Registration Process
1. User submits registration form with verification method choice
2. System validates age (13+) and input data
3. Checks for existing verified accounts
4. Limits registration attempts (max 3 unverified accounts)
5. Generates and sends OTP via chosen method (email/SMS)
6. User verifies OTP to activate account

### Login Process
1. User chooses login method (password or OTP)
2. **Password Method**: Direct authentication with stored password
3. **OTP Method**: 
   - Request OTP via API
   - System sends OTP to registered email/phone
   - User enters OTP for authentication
4. Successful authentication returns JWT token

### Security Features
- **JWT Tokens**: Secure session management
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Account Verification**: Mandatory verification for new accounts
- **Automated Cleanup**: Removes unverified accounts after 30 minutes

## 🗄️ Database Schema

### User Model
```typescript
{
  name: string,              // Full name (4-30 characters)
  email: string,             // Unique email address
  password: string,          // Hashed password (8+ characters)
  phone: string,             // Phone number for SMS
  dateOfBirth: Date,         // Birth date (must be past)
  accountVerified: boolean,  // Verification status
  verificationCode: number,  // OTP code
  verificationCodeExpire: Date, // OTP expiration
  resetPasswordToken: string,   // Password reset token
  resetPasswordExpire: Date,    // Reset token expiration
  loginMethod: 'password' | 'otp', // Preferred login method
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model
```typescript
{
  user: ObjectId,           // Reference to User
  title: string,            // Note title (required)
  content: string,          // Note content (optional)
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration Details

### MongoDB Connection
- Uses Mongoose for ODM
- Database name: `notes_app`
- Automatic connection retry logic

### Email Service (Nodemailer)
- SMTP configuration for multiple providers
- HTML email templates
- Secure authentication

### SMS Service (Twilio)
- Formatted OTP delivery
- International phone number support
- Delivery status tracking

### Automated Tasks
- **Cleanup Job**: Runs every 30 minutes
- **Target**: Unverified accounts older than 30 minutes
- **Purpose**: Maintains database hygiene

## 🛡️ Security Implementation

### Password Security
- Minimum 8 characters requirement
- Bcrypt hashing with salt rounds
- Password comparison using secure methods

### JWT Security
- Configurable expiration times
- HTTP-only cookies for token storage
- Automatic token validation middleware

### Input Validation
- Email format validation
- Phone number validation
- Age verification (13+ requirement)
- XSS protection via sanitization

### Error Handling
- Custom error classes for different scenarios
- Detailed error logging for debugging
- User-friendly error messages
- Stack trace hiding in production

## 🚀 Deployment

### Environment Setup
1. Set all environment variables
2. Ensure MongoDB connection
3. Configure Twilio credentials
4. Set up email service
5. Update CORS origins for production

### Production Considerations
- Enable MongoDB Atlas connection
- Use production JWT secrets
- Configure proper CORS origins
- Set up proper logging
- Enable HTTPS
- Configure rate limiting

## 🧪 Testing

### Manual Testing Completed
- ✅ User registration with email/SMS OTP
- ✅ Account verification process
- ✅ Dual login methods (password/OTP)
- ✅ Password reset functionality
- ✅ Notes CRUD operations
- ✅ Authentication middleware
- ✅ Automated account cleanup

### Testing Endpoints
Use tools like Postman or curl to test API endpoints with proper headers and authentication tokens.

## 📚 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "dateOfBirth": "1990-01-01",
    "verificationMethod": "email"
  }'
```

### Login with Password
```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "loginMethod": "password"
  }'
```

### Create Note
```bash
curl -X POST http://localhost:3000/api/v1/user/notes \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token" \
  -d '{
    "title": "My First Note",
    "content": "This is the content of my note."
  }'
```

## 🔍 Monitoring & Debugging

### Logging
- Morgan HTTP request logging
- Console error logging for debugging
- Environment-based log levels

### Health Checks
- Database connection monitoring
- Service availability checks
- Error rate monitoring

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Add JSDoc comments for functions
5. Test thoroughly before committing

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the error logs
2. Verify environment variables
3. Ensure database connectivity
4. Validate API request formats