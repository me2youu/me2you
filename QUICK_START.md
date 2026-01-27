# 🚀 Quick Start Guide - Get Running in 5 Minutes

## Prerequisites
- Node.js 18+ installed
- A Neon account (free tier: https://neon.tech)
- A Clerk account (free tier: https://clerk.com)

---

## Step 1: Install Dependencies (30 seconds)

```bash
npm install
```

---

## Step 2: Set Up Neon Database (2 minutes)

1. Go to https://neon.tech and sign up
2. Create a new project (name it "me2you")
3. Copy your connection string from the dashboard
4. It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`

---

## Step 3: Set Up Clerk (2 minutes)

1. Go to https://clerk.com and sign up
2. Create a new application (name it "Me 2 You")
3. Go to **API Keys** in the sidebar
4. Copy your **Publishable Key** (starts with `pk_test_`)
5. Copy your **Secret Key** (starts with `sk_test_`)

---

## Step 4: Configure Environment (1 minute)

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
# From Neon
DATABASE_URL=postgresql://your-connection-string-here

# From Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Leave these as-is
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 5: Initialize Database (30 seconds)

```bash
npm run db:push
```

You should see output like:
```
✓ Pushed schema changes to database
```

---

## Step 6: Start the Server (10 seconds)

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## Step 7: Create Your First Template (1 minute)

1. Go to http://localhost:3000/admin
2. Click **"Load Sample Valentine Template"**
3. Click **"Create Template"**
4. ✅ Done! Your first template is ready.

---

## Step 8: Test the Full Flow (2 minutes)

1. Go to http://localhost:3000
2. Click **"Create Your Gift"**
3. Click on the Valentine template
4. Fill in:
   - Recipient Name: "Sarah"
   - Message: "You're amazing! 💕"
5. Click **"Show Preview"** to see it live
6. Click **"Create Gift"**
7. Copy the link and open it in a new tab
8. 🎉 See your personalized gift!

---

## 🎯 You're All Set!

Your Me 2 You platform is now fully functional. Here's what you can do:

### For Testing
- Create more templates at `/admin`
- Customize and create gifts at `/templates`
- Share gift links with friends

### For Development
- Check `MVP_COMPLETE.md` for full feature list
- Read `IMPLEMENTATION_PLAN.md` for architecture details
- See `KNOWLEDGE.md` for product vision

### For Deployment
- Deploy to Vercel (one-click: https://vercel.com/new)
- Add production environment variables in Vercel dashboard
- Update `NEXT_PUBLIC_APP_URL` to your production domain

---

## 🐛 Troubleshooting

### "DATABASE_URL is not set"
→ Make sure you created `.env.local` and added your Neon connection string

### "Unauthorized" when creating template
→ Sign in first at http://localhost:3000/sign-in

### Templates page is empty
→ Go to `/admin` and create your first template

### Can't see preview
→ Click "Show Preview" button in the customization form

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## 📚 Next Steps

### Add More Templates
- Birthday template
- Christmas template
- "Thank You" template
- Congratulations template

### Customize the Sample Template
- Edit colors in CSS
- Change animations
- Add more interactive elements
- Upload to Vercel Blob for images

### Add Features
- User dashboard
- Gift analytics
- Email notifications
- Stripe payments

---

## 🎉 Happy Building!

You now have a fully functional gift platform ready for Valentine's Day 2026!

**Need help?** Check the other documentation files or the code comments.

**Want to deploy?** Push to GitHub and connect to Vercel - it's that easy!

---

**Total Setup Time: ~10 minutes**

**What You Get:**
- ✅ Full authentication
- ✅ Template system
- ✅ Gift creation
- ✅ Shareable links
- ✅ Admin panel
- ✅ Beautiful UI
- ✅ Mobile responsive
- ✅ Production ready

🚀 **Let's make Valentine's Day special!**
