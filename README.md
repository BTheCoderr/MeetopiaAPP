# Meetopia

A modern meeting scheduling and management application built with Next.js that helps teams coordinate and organize their meetings efficiently.

## Features

- Video Chat with camera/mic controls
- Text Chat with emoji support
- Combined Chat (Video + Text)
- User Authentication (Email/Password)
- Report/Feedback System
- Real-time Communication using Socket.IO
- Responsive Design with TailwindCSS
- MongoDB Database Integration
- Session Management

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB
- Prisma
- Socket.IO
- TailwindCSS
- bcryptjs for password hashing
- JWT for session management

## Prerequisites

- Node.js >= 18.18.0
- MongoDB running locally or a MongoDB Atlas account
- PostgreSQL for Prisma (optional, if using Prisma features)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MeetopiaAPP.git
cd MeetopiaAPP
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_postgresql_url  # Only if using Prisma
```

4. Run database migrations (if using Prisma):
```bash
npx prisma generate
npx prisma migrate dev
```

5. Seed the database with a test user:
```bash
npm run seed
```
This will create a test user with:
- Email: demo@example.com
- Password: test123

6. Start the development server:
```bash
npm run dev
```

7. Open http://localhost:3000 in your browser

## Features in Detail

### Chat Options
- Video Chat: One-on-one video calls with camera/mic controls
- Text Chat: Real-time messaging with emoji support
- Combined Chat: Video calls with text chat functionality

### User Management
- Sign Up/Sign In with email and password
- Session-based authentication
- Profile management

### Report System
- Report inappropriate users
- Provide feedback for improvements
- Admin review system for reports

## Deployment

The application can be deployed on platforms like Vercel or Render. Make sure to:
1. Set up the environment variables in your deployment platform
2. Configure the build command: `npm run build`
3. Configure the start command: `npm start`
4. Set up MongoDB Atlas for the database
5. Update CORS settings if needed

## Recent Updates

- Added report/feedback system
- Improved error handling in chat features
- Fixed authentication issues
- Added proper TypeScript types
- Improved MongoDB connection handling
- Added session management
- Fixed build and deployment issues

## Known Issues

- Socket.IO requires separate server setup for production
- Viewport warnings in development (expected behavior)
- Dynamic server usage with cookies (expected in Next.js 14)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Troubleshooting

If you encounter any issues:

1. Make sure MongoDB is running locally or your MongoDB Atlas connection string is correct
2. Verify Node.js version is >= 18.18.0
3. Clear `.next` directory and node_modules if you encounter build issues:
```bash
rm -rf .next node_modules
npm install
```
4. Check environment variables are properly set
5. Make sure all required ports are available (3000 for Next.js, 27017 for MongoDB)
