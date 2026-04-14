# Visthar Ecommerce Platform - PRD

## Original Problem Statement
Build a world-class, premium, highly animated, conversion-optimized ecommerce website for "Visthar" - a futuristic mobile accessories brand focused on eco-friendly products, AI-powered devices, and accessibility innovation.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT Bearer tokens (bcrypt hashing)
- **Payment**: Razorpay (MOCKED - test keys placeholder)
- **Shipping**: MOCKED delivery tracking
- **Email**: MOCKED notifications

## User Personas
1. **Consumer** - Browse products, add to cart, checkout, track orders
2. **Pre-booker** - Interested in coming-soon AI products
3. **B2B/OEM** - Bulk order inquiries
4. **Admin** - Manage products, orders, users, view analytics

## Core Requirements
- Dark theme with green neon highlights (eco-tech aesthetic)
- Animated loading screen, hero section, scroll animations
- Product browsing with category filters
- Cart system (guest + authenticated)
- Checkout with address management
- Order tracking with status flow
- Pre-booking for AI products
- OEM inquiry system
- Newsletter subscription
- Admin panel with dashboard

## What's Been Implemented (April 14, 2026)
### Backend (100% functional)
- JWT Authentication (register, login, profile, addresses)
- Products CRUD with 14 seeded products (12 regular + 2 coming-soon)
- Cart system (persistent, guest + logged-in)
- Orders (create, list, track, status updates)
- Pre-booking system
- OEM/B2B lead capture
- Newsletter subscription
- Reviews system (36 seeded reviews)
- Admin panel APIs (dashboard, orders, users, products, prebookings, OEM)
- Admin seeding on startup

### Frontend
- Animated loading screen with gold logo
- Sticky glassmorphism navbar with boAt-style category bar
- Homepage: Hero, Trust, Featured Products, Categories, Coming Soon (India's First blur), Sustainability, Innovation, Browse Categories, OEM
- Product listing with category filters + search
- Product detail with image zoom, specs, reviews, related products
- Cart with quantity controls
- Checkout (address + COD payment)
- Auth (login/register with toggle)
- Profile page (orders with tracking, addresses, profile info)
- Admin dashboard (stats, orders, products, users, prebookings, OEM)
- Footer with category strip + newsletter

## Prioritized Backlog
### P0 (Critical)
- [x] Core user flow: browse → cart → checkout → order
- [x] Auth system
- [x] Admin panel

### P1 (Important)
- [ ] Razorpay live payment integration
- [ ] Shiprocket/Delhivery real shipping API
- [ ] Email notifications (SendGrid/Resend)
- [ ] Image upload for product management

### P2 (Nice to Have)
- [ ] Google Analytics integration
- [ ] Blog section
- [ ] SEO meta tags + schema markup
- [ ] Wishlist functionality
- [ ] Password reset flow
- [ ] Advanced admin analytics charts

## Next Tasks
1. Integrate Razorpay with real test keys from user
2. Add email notifications for order confirmation/shipping
3. Implement real shipping tracking API
4. Add product image upload in admin
5. SEO optimization
