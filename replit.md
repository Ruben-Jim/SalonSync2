# Replit.md

## Overview

This is a full-stack beauty salon booking application built with React, Express, and PostgreSQL. The application allows customers to browse services, select staff members, book appointments, and make payments through Stripe integration. It features a modern UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom salon-themed color variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Payment Processing**: Stripe integration for secure payments
- **Development**: Hot module replacement via Vite integration

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migration**: Schema-first approach with migrations in `./migrations`
- **Connection**: Neon Database serverless connection
- **Tables**: Services, Staff, Clients, and Appointments with proper relationships

## Key Components

### Data Models
1. **Services**: Hair and nail services with pricing, duration, and down payment options
2. **Staff**: Service providers with specialties and experience details
3. **Clients**: Customer information and contact details
4. **Appointments**: Booking records linking clients, services, and staff with payment status

### User Interface Components
1. **BookingWizard**: Multi-step appointment booking flow
2. **ServiceCard**: Display service details with pricing and duration
3. **StaffCard**: Show staff member information and ratings
4. **AppointmentCard**: Appointment management with status updates
5. **Header**: Navigation with salon branding

### Payment Integration
- Stripe Elements for secure payment processing
- Down payment support for services requiring deposits
- Payment confirmation and appointment status updates

## Data Flow

### Booking Process
1. Customer selects service from available options
2. Customer chooses preferred staff member
3. Customer selects date and time slot
4. Customer enters personal information
5. System creates appointment with "pending" status
6. If down payment required, customer proceeds to Stripe checkout
7. Payment confirmation updates appointment status to "confirmed"

### Appointment Management
1. Staff can view all appointments with filtering options
2. Appointment status can be updated (pending → confirmed → completed)
3. Payment status tracking for down payments and remaining balances

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database queries and schema management
- **@stripe/stripe-js & @stripe/react-stripe-js**: Payment processing integration
- **@tanstack/react-query**: Server state management and caching

### UI Libraries
- **@radix-ui/***: Accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library with consistent styling
- **react-hook-form**: Form state management with validation

### Development Tools
- **tsx**: TypeScript execution for Node.js development
- **esbuild**: Fast JavaScript bundler for production builds
- **vite**: Development server with hot module replacement

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React application to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations can be applied via `npm run db:push`

### Environment Configuration
- **Development**: Uses tsx for server execution with Vite integration
- **Production**: Serves static files from Express with compiled bundles
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **Payments**: Requires `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY` for payment processing

### Hosting Considerations
- Application designed for serverless deployment (Neon Database)
- Static assets served from Express in production
- Session storage requires PostgreSQL connection for persistence
- Stripe webhook endpoints may need separate configuration for production payments

The architecture prioritizes developer experience with TypeScript throughout, modern React patterns, and a clean separation between client and server code while maintaining shared type definitions.

## Recent Changes

### July 19, 2025
- ✅ Complete booking and payment integration implemented and tested
- ✅ Stripe payment processing working for down payments (hair services)
- ✅ Direct booking confirmed for services without down payments (nail services)
- ✅ API endpoints fully functional: services, staff, appointments, payment intents
- ✅ Frontend booking wizard with 3-step process working seamlessly
- ✅ Payment flow supports Apple Pay, Google Pay, and debit/credit cards through Stripe Elements
- ✅ Appointment management system displaying all bookings with status tracking