# WhoAmI - Identity Artifacts

> **Identity, crafted.** 🇮🇳

A minimalistic, premium product showcase and storefront for **WhoAmI** - India's home for handcrafted fandom merchandise. 3D-printed and laser-cut desk accessories, collectibles, and personalized gifts for fans of legendary sagas, cinematic universes, and iconic characters.

---

## 🎯 About WhoAmI

WhoAmI is an Indian D2C brand that creates handcrafted merchandise for dedicated fans. Our products help fans:

- **Prove their identity** - Display your favorite universe, your iconic heroes, or your legendary allegiances.
- **Decorate their desks** - Transform workspaces into fandom shrines with premium, 3D-printed desk accessories.
- **Gift with meaning** - Find personalized gifts that resonate with fellow fans.

**Latest Features:**
- **Next.js App Router**: Lightning-fast Server Components and optimized routing.
- **Supabase Integration**: Live inventory and product management backed by PostgreSQL.
- **Image Optimization**: Fully optimized WebP assets for premium performance.
- **Identity-First Design**: A premium, "glassmorphism" UI with gold accents throughout.
- **Community Proof**: Dedicated testimonials section featuring real stories from our community.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js (App Router)** for fast, SEO-friendly React rendering
- **CSS Modules / Vanilla CSS** with custom design system
- **React Context API** for global state management (Shopping Bag)

### Backend & Database
- **Node.js + Express** (Legacy APIs, preserved for backward compatibility)
- **Supabase (PostgreSQL)** for dynamic inventory management
- **Redis** for rate-limiting and caching

### Design System
| Color | Hex | Usage |
|-------|-----|-------|
| Charcoal Black | `#0F0F0F` | Primary text, headers |
| Warm White | `#F5F5F3` | Backgrounds |
| Graphite Grey | `#2B2B2B` | Secondary text |
| Deep Blue-Grey | `#1E2A33` | Accent color |

Typography: **Inter** (Google Fonts)

---

## 📁 Project Structure

```
web/
├── app/                  # Next.js Server & Client Pages (Routes)
├── archive_temp/         # Deprecated Vite/React SPA files
├── components/           # Reusable React components (Navbar, Footer, Hero)
├── config/               # App configuration files
├── context/              # React Context Providers (CartContext)
├── public/               # Static assets, WebP product images
├── server/               # Express Backend API & DB Scripts
├── styles/               # Global CSS and module styles
├── utils/                # Helper utilities (slugify, formatPrice)
├── .env.example          # Environment variable template
├── next.config.mjs       # Next.js configuration
└── package.json          # Dependency manifest
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

**1. Clone and Install Dependencies**
```bash
npm install
```

**2. Setup Environment Variables**
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

**3. Install Backend Dependencies (Optional)**
```bash
cd server
npm install
```

### Running the Application

Open **two terminals**:

**Terminal 1 - Next.js Frontend:**
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

**Terminal 2 - Express Backend:**
```bash
cd server
npm start
```
Backend runs on: `http://localhost:5001` (Adjusted to avoid conflicts)

---

## 📊 Product Data (Supabase)

Products are dynamically managed via **Supabase**. The old Excel workflow is deprecated.

### Inventory Scripts
To manage inventory programmatically, utilize the scripts in the `server/scripts/` directory:
- `node server/scripts/inventory.js` - Interactive CLI to add/edit/delete products.
- `node server/scripts/update_db_to_webp.js` - Optimizes DB URLs to point to WebP variants.

---

## 🌐 API Endpoints

Base URL: `http://localhost:5001/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | GET | Get all products |
| `/products/:id` | GET | Get single product |
| `/products/combos` | GET | Get curated product combos |
| `/products/reload` | POST | Clear Redis cache |
| `/health` | GET | Server health check |

---

## 📄 Core Routes

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, fandoms showcase, featured products, testimonials |
| Products | `/products` | All products with category filters |
| Product Detail | `/products/:slug` | SEO-friendly individual product pages |
| Categories | `/categories/:slug` | Dynamic category-specific collections |
| Cart | `/cart` | Shopping bag and checkout summary |
| About | `/about` | Brand story, values, Made in India |

---

## 🇮🇳 Made in India

WhoAmI is proudly designed, crafted, and shipped from India. We support local manufacturing while creating world-class fandom merchandise for fans across the country.

---

## 📝 Development Scripts

**Frontend:**
```bash
npm run dev      # Start Next.js dev server
npm run build    # Build optimized production bundle
npm start        # Start Next.js production server
```

---

## 🔒 Important Notes

- 📧 Contact form includes real-time validation.
- 🖼️ Product images are optimized continuously into `.webp` format in `public/products/`.

---

**WhoAmI** - Identity, crafted. 🇮🇳 ✦
