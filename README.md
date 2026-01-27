# Me 2 You - Personalized Digital Gifts

Create charming, interactive mini websites as digital gifts for the people you care about.

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Neon Postgres account (free tier: https://neon.tech)
- A Clerk account (free tier: https://clerk.com)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Neon Database**
   
   - Create a new project at https://neon.tech
   - Copy your connection string
   - Add it to `.env.local` as `DATABASE_URL`

4. **Configure Clerk Authentication**
   
   - Create a new application at https://clerk.com
   - Copy your publishable and secret keys
   - Add them to `.env.local`:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
     CLERK_SECRET_KEY=sk_test_xxxxx
     ```

5. **Run database migrations**
   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Visit http://localhost:3000

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── page.tsx        # Landing page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/         # React components
├── lib/
│   └── db/            # Database configuration
│       ├── schema.ts  # Drizzle schema
│       └── index.ts   # Database client
└── middleware.ts      # Clerk auth middleware
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres (serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Payments**: Stripe (coming soon)

## Features

### Current
- ✅ Landing page with occasion categories
- ✅ Database schema for templates, gifts, users, orders
- ✅ Clerk authentication setup

### In Progress
- 🚧 Template browser
- 🚧 Gift customization flow
- 🚧 Admin panel

### Planned
- 📋 Stripe payment integration
- 📋 Gift page rendering
- 📋 Email notifications
- 📋 QR code generation

## Database Schema

See `src/lib/db/schema.ts` for the complete schema.

### Main Tables
- `users` - User accounts (Clerk integration)
- `templates` - Gift templates with HTML/CSS/JS
- `gifts` - Personalized gift instances
- `addons` - Purchasable add-ons (animations, music, etc.)
- `orders` - Payment records

## Development

### Adding a new page
Create a new folder in `src/app/` following Next.js App Router conventions.

### Database changes
1. Update `src/lib/db/schema.ts`
2. Run `npm run db:push` to apply changes

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Make sure to add all environment variables in your Vercel project settings.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
