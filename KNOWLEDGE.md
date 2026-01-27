# 📚 Knowledge File for *Me 2 You*

## 🌍 Product Vision

**Me 2 You** is a platform where users can purchase and customize **mini websites** as **digital gifts** for others. These personalized web pages are designed for occasions like **Valentine's Day**, **birthdays**, **Christmas**, and even fun, competitive moments (like when your sports team beats your friend's).

Each site is designed to be **charming**, **interactive**, and **emotionally resonant**—a digital greeting card on steroids. The goal is to deliver joy, surprise, and laughter in a customizable, affordable, and instantly sharable way.

---

## Demos of websites which would be customisably for sale
https://lukerenton.github.io/BeMyValentine/

https://lukerenton.github.io/Meme-a-day/


## 🧑‍🤝‍🧑 User Personas & Journeys

### 1. 🎁 Giver (Primary User)

**Profile**: 16–35 y/o, social media savvy, enjoys memes, digital native
**Motivations**:

* Wants to surprise or cheer someone up in a unique way
* Celebrating occasions (Valentine's, Birthday, etc.) or just wants to encourage someone (meme-a-day website)
* Looking for something more personal than a text or e-card

> These are really good exmaples of what would be customisably for sale: https://lukerenton.github.io/BeMyValentine/ https://lukerenton.github.io/Meme-a-day/

**Journey**:

1. Lands on the home page
2. Browses templates by occasion
3. Selects a template (prompted to make an account - please use Clerk for this)
4. Customizes message, visuals, and optional add-ons
5. Previews website
6. Pays (via Stripe)
7. Receives a unique URL or QR code to share with recipient

### 2. 😮 Receiver (Gift Recipient)

**Profile**: Any age, no login required
**Journey**:

1. Gets link from friend via text/social media
2. Opens link → sees the customized interactive site
3. Laughs/cries/enjoys → possibly shares or saves it

### 3. 🛠️ Admin (Internal)

**Role**:

* Add or edit templates
* Manage seasonal template rollouts
* View orders & usage metrics
* Review reported links (if moderation needed)

---

## ✨ Key Features & Functionality

### MVP Scope

* **Landing Page** with occasion-based template categories
* **Template Viewer** with preview & selection
* **Customization Form** with:
  * Name of recipient
  * Personal message
  * Optional add-ons (animations, audio, hidden messages)
* **Preview Mode** before purchase
* **Checkout** (Stripe Integration)
* **URL Generator** to share custom page
* **Hosting** of live pages on custom paths (e.g. `me2you.world/gift/abc123`)
* **Responsive Design** (mobile-first)

### Planned Add-ons (Upsell Features)

* Animated buttons (e.g. Yes/No button playfulness)
* Background music (custom or preset)
* QR code generation for physical printouts
* Hidden Easter eggs
* Countdown timers
* Scheduled sending (v2+)
* Custom domain aliasing (e.g. `sarahsvalentine.me2you.world`)
* User generated templates which when sold they get a percent of (v2+)

---

## 🎨 Design System & UI Guidance

### Brand Feel:

* Indicates love (romantic or platonic), light-hearted

### Fonts:

* Friendly rounded fonts (e.g. Inter, Poppins, Comic Neue)
* Occasion-based variation (e.g. script font for Valentine's)


### UI Components:

* Card-like modals
* Toggle switches for add-ons
* Large CTA buttons
* Animated or playful elements in templates


## 👤 Role-Specific Behavior

### User (Gift Creator)

* No account required (for MVP)
* Can build and purchase a gift
* Receives link/QR code upon payment

### Admin

* Can add/edit templates
* Can tag templates by occasion
* Can flag/remove inappropriate content (moderation system for v2)
* Access analytics dashboard

### Gift Receiver

* No login required
* Just receives and views the personalized webpage

---

## 📋 Sample Landing Pages

![Sample landing page](image.png)
![Sample landing page I](image-1.png)
![Sample landing page II](image-2.png)
