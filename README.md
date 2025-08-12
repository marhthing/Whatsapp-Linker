# WhatsApp Bridge Web Application

A modern web application for managing WhatsApp sessions with an admin panel, built for deployment on Vercel.

## Features

- **Public WhatsApp Linking**: Users can link their WhatsApp accounts using QR code or pairing code methods
- **Admin Panel**: Password-protected interface to view and manage all WhatsApp sessions
- **PostgreSQL Database**: Session data stored securely in Neon database
- **Bot Settings Configuration**: Configure anti-delete message forwarding and other bot features
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Architecture

### Frontend
- React 18 with TypeScript
- Vite for fast development and builds
- Tailwind CSS + shadcn/ui for styling
- TanStack Query for state management
- Wouter for routing

### Backend API (Serverless)
- Vercel serverless functions
- PostgreSQL with Drizzle ORM
- Neon database hosting
- RESTful API design

## Database Schema

- `whatsapp_sessions`: Stores WhatsApp session data, QR codes, pairing codes
- `bot_settings`: Bot configuration per session (anti-delete JID, etc.)
- `admin_settings`: Admin panel configuration and password

## Deployment

This app is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Set the DATABASE_URL environment variable in Vercel
3. Deploy - Vercel will automatically build and deploy the app

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up database:
   ```bash
   npm run db:push
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5000`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (Neon database)

## Admin Access

Default admin password: `admin123`

Access the admin panel at `/admin` to:
- View all WhatsApp sessions
- Monitor session status and statistics  
- Delete inactive sessions
- Configure bot settings

## API Endpoints

### Public Endpoints
- `POST /api/link` - Create new WhatsApp session (QR or pairing code)
- `GET /api/session/:sessionId` - Get session data for bot
- `PUT /api/session/:sessionId` - Update session status from bot

### Admin Endpoints  
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/sessions` - Get all sessions with statistics
- `DELETE /api/admin/sessions/:sessionId` - Delete a session

## Bot Integration

Bots can integrate with this system by:

1. Getting a session ID from the `/api/link` endpoint
2. Using the session ID to fetch session data from `/api/session/:sessionId`
3. Updating session status via `PUT /api/session/:sessionId`
4. Getting bot settings from `/api/bot-settings/:sessionId`

## Security

- Admin panel protected by password authentication
- Database connection uses SSL
- Session data properly validated
- API request validation with Zod schemas

## License

MIT