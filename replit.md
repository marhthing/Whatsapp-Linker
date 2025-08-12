# WhatsApp Bridge Web Application

## Overview

A modern web application for managing WhatsApp sessions with an admin panel. The application provides a user-friendly interface for linking WhatsApp accounts via QR codes or pairing codes, along with administrative controls for session management and bot settings configuration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with simple route definitions
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with structured error handling
- **Session Management**: Custom session storage with database persistence
- **Request Logging**: Built-in middleware for API request/response logging

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Management**: Code-first approach with migrations support
- **Connection**: Connection pooling with @neondatabase/serverless

### Key Features
- **WhatsApp Integration**: Support for both QR code and pairing code authentication methods
- **Admin Panel**: Protected administrative interface for session management
- **Session Management**: CRUD operations for WhatsApp sessions with status tracking
- **Bot Settings**: Configurable bot behavior settings per session
- **Real-time Updates**: Automatic data refresh and state synchronization

### Development Environment
- **Development Server**: Vite dev server with HMR (Hot Module Replacement)
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with shared types and schemas
- **Build Process**: Optimized builds with esbuild for server and Vite for client

### Security & Authentication
- **Admin Authentication**: Password-based admin access with session management
- **API Protection**: Protected admin routes with authentication middleware
- **Data Validation**: Zod schemas for runtime type validation and API request/response validation

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

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