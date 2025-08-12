# WhatsApp Bridge Web Application

## Overview

A modern web application for managing WhatsApp sessions with an admin panel, designed for Vercel serverless deployment. The application provides a user-friendly interface for linking WhatsApp accounts via QR codes or pairing codes, along with administrative controls for session management and bot settings configuration. Uses Neon PostgreSQL database for session storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Database Migration**: Updated to use user's Neon PostgreSQL database instead of Replit's built-in database
- **Vercel Deployment Setup**: Created serverless API functions in `/api` directory for Vercel deployment
- **Database Schema**: Implemented proper schema with whatsapp_sessions, bot_settings, and admin_settings tables
- **Admin Panel**: Password-protected admin interface (default: admin123)
- **Public Interface**: Clean UI for WhatsApp linking with QR code and pairing code options
- **Environment Variables**: All API functions now use DATABASE_URL secret instead of hardcoded values

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with simple route definitions
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Deployment**: Vercel serverless functions for scalable hosting
- **Runtime**: Node.js with TypeScript
- **API Pattern**: RESTful API design with structured error handling
- **Database**: Neon PostgreSQL with SSL connection
- **Request Validation**: Zod schemas for API request/response validation

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: Neon PostgreSQL (user-provided connection string)
- **Schema Management**: Code-first approach with automatic migrations via drizzle-kit
- **Connection**: Serverless connection pooling with @neondatabase/serverless
- **Tables**: whatsapp_sessions, bot_settings, admin_settings

### Key Features
- **WhatsApp Integration**: Support for both QR code and pairing code authentication methods (WABridge-xxxxxxxx format)
- **Admin Panel**: Password-protected administrative interface for session management
- **Session Management**: CRUD operations for WhatsApp sessions with status tracking
- **Bot Settings**: Configurable anti-delete message forwarding with custom JID settings
- **Public Access**: Easy-to-access WhatsApp linking interface for end users
- **Serverless Architecture**: Optimized for Vercel deployment with edge functions

### Development Environment
- **Development Server**: Vite dev server with HMR (Hot Module Replacement)
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with shared types and schemas
- **Build Process**: Optimized builds with esbuild for server and Vite for client

### Security & Authentication
- **Admin Authentication**: Simple password-based admin access (default: admin123)
- **Database Security**: SSL-enabled Neon PostgreSQL connection
- **API Validation**: Comprehensive Zod schemas for all API endpoints
- **Public/Private Separation**: Clear distinction between public linking and admin functions

## External Dependencies

### Database Services
- **Neon Database**: User-provided PostgreSQL hosting with serverless connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### Deployment Services
- **Vercel**: Serverless hosting platform with edge functions and automatic deployments

### UI Framework Dependencies
- **Radix UI**: Comprehensive set of accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Feather-inspired icon library for consistent iconography

### Development Tools
- **Vite**: Modern build tool with fast development server and optimized production builds
- **TanStack Query**: Powerful data synchronization library for server state management
- **React Hook Form**: Performant forms library with minimal re-renders

### Runtime Dependencies
- **Express.js**: Web application framework for Node.js API server
- **ws**: WebSocket library for real-time communication capabilities
- **date-fns**: Modern JavaScript date utility library for date manipulation

### Validation & Type Safety
- **Zod**: TypeScript-first schema validation library
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for database schema validation