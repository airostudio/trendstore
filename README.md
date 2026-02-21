# TrendStore - Viral Product Store

A static HTML/CSS/JavaScript e-commerce platform for trending viral products. No database, no backend - just pure static files deployed to Vercel.

## Features

- 🔥 Browse viral and trending products from TikTok/Instagram
- 🛒 Shopping cart with localStorage
- 💳 Checkout flow (demo mode)
- 📊 Admin panel with authentication
- 📱 Fully responsive design
- ⚡ Fast static deployment

## Architecture

This is a **static site** following the same pattern as [apartment3](https://github.com/airostudio/apartment3):

- **No database** - Data stored in JSON files
- **No backend** - All logic runs client-side
- **No build process** - Deploy directly to Vercel
- **Session-based admin auth** - Credentials in settings.json

## File Structure

```
trendstore/
├── admin/              # Admin panel pages
│   ├── index.html      # Dashboard
│   ├── login.html      # Admin login
│   ├── products.html   # Product management
│   ├── orders.html     # Order management
│   └── settings.html   # Settings page
├── css/
│   ├── main.css        # Main site styles
│   └── admin.css       # Admin panel styles
├── data/
│   ├── products.json   # Product database
│   └── settings.json   # Site configuration
├── js/
│   ├── app.js          # Main app logic
│   ├── cart.js         # Shopping cart
│   ├── products.js     # Product display
│   └── admin-auth.js   # Admin authentication
├── images/             # Product/site images
├── index.html          # Homepage
├── products.html       # Product listing
├── cart.html           # Shopping cart
├── checkout.html       # Checkout page
├── confirmation.html   # Order confirmation
└── vercel.json         # Vercel config
```

## Data Management

### Products (`data/products.json`)

Each product has:
- Basic info (name, description, price)
- Categories and tags
- Stock and variants
- Social metrics (views, sales, ratings)
- Viral/trending status

### Settings (`data/settings.json`)

Site configuration:
- Branding (name, colors, tagline)
- Fees and shipping rates
- Admin credentials
- Social media links

## Admin Access

**Login:** `/admin/login.html`

**Demo Credentials:**
- Email: `admin@trendstore.com`
- Password: `TrendAdmin2026!`

**Role:** Owner (full access)

## Authentication

Client-side session authentication using `sessionStorage`:
- Credentials hardcoded in `data/settings.json`
- Session checked by `admin-auth.js`
- **Not suitable for production** (demo/prototype only)

## Shopping Cart

- Stored in browser `localStorage`
- Persists across page reloads
- Items, quantities, and totals calculated client-side

## Deployment

Deployed to Vercel as static files:

1. Push to GitHub
2. Vercel auto-deploys from branch
3. No build step required
4. Files served directly

**Branch:** `claude/fix-nextjs-build-1AZ5G`

## Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# VS Code Live Server extension
```

Then visit `http://localhost:8000`

## Limitations

This is a **demo/prototype application**:

- ❌ No real payment processing
- ❌ Orders not persisted (localStorage only)
- ❌ Admin changes not saved to JSON files
- ❌ No user authentication
- ❌ Credentials visible in source code

For production, you would need:
- Backend API for data persistence
- Database for products/orders/users
- Real payment integration (Stripe)
- Server-side authentication
- Secure credential storage

## Inspiration

Based on the architecture of [apartment3](https://github.com/airostudio/apartment3) - a static accommodation booking platform.

## License

MIT
