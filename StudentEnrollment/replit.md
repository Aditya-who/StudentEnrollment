# Overview

Achievo is a student achievement management platform that enables students to upload and validate their academic and extracurricular achievements. The system allows students to showcase accomplishments like hackathon certificates, sports achievements, internship offers, and other activities, while providing faculty members with tools to validate and approve these submissions. The platform includes social features like liking and commenting on achievements, a leaderboard system with points-based ranking, and portfolio generation capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript and follows a component-based architecture. It uses Vite as the build tool and development server. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, styled with Tailwind CSS using CSS variables for theming. The application uses Wouter for client-side routing and TanStack Query for server state management and caching. Form handling is implemented with React Hook Form and Zod for validation.

## Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design. Authentication is handled using Passport.js with local strategy, session-based authentication with PostgreSQL session storage. The application uses a monorepo structure with shared schema definitions between client and server. File uploads are managed using Multer middleware with local file storage.

## Database Layer
The application uses Drizzle ORM with PostgreSQL as the primary database. The database is hosted on Neon (serverless PostgreSQL). The schema includes users, achievements, likes, comments, and points configuration tables with proper foreign key relationships. Database migrations are managed through Drizzle Kit.

## Authentication & Authorization
Authentication is implemented using Passport.js with local username/password strategy. Sessions are stored in PostgreSQL using connect-pg-simple. The system supports role-based access control with three user roles: student, faculty, and admin. Password hashing is implemented using Node.js crypto module with scrypt algorithm.

## File Management
File uploads are handled using Multer with local disk storage. Uploaded files (certificates, images) are stored in an uploads directory with unique filenames. File access is protected by authentication middleware, ensuring only logged-in users can access uploaded files.

## State Management
Client-side state management is handled by TanStack Query for server state (API data, caching, synchronization) and React's built-in state management for local UI state. The application implements optimistic updates and proper error handling for mutations.

## UI/UX Architecture
The interface follows a modern design system using shadcn/ui components with consistent theming through CSS custom properties. The layout is responsive with mobile-first design principles. Navigation is handled through a persistent navbar with role-based menu items.

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management for user authentication

## Frontend Libraries
- **React**: UI library with TypeScript support
- **Vite**: Build tool and development server with HMR
- **TanStack Query**: Server state management and data fetching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation and type inference

## UI Components
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## File Handling
- **Multer**: Multipart form data handling for file uploads
- **Local File Storage**: Files stored in server filesystem (uploads directory)

## Development Tools
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer