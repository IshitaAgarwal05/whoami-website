# WhoAmI - Identity Artifacts Monorepo

> **Identity, crafted.** 🇮🇳

A minimalistic, premium storefront and operations platform for **WhoAmI** - India's home for handcrafted fandom merchandise. 3D-printed and laser-cut desk accessories, collectibles, and personalized gifts.

---

## 🎯 Project Architecture

This project is structured as an npm workspaces monorepo:

*   **`apps/web`**: Next.js App Router frontend. Beautiful glassmorphism design system, optimized image rendering, shopping cart context, and product pages.
*   **`apps/cms`**: Strapi v5 Community Edition Headless CMS (PostgreSQL database). Manages the product catalog, categories, combos, blogs, navigation menus, and homepage content. Includes the custom **Founder Dashboard** plugin.
*   **`services/api`**: Express.js transactional server. Handles checkout operations, customer records, inventory transaction ledger, audit logs, contact form submissions, and newsletter subscriptions on PostgreSQL. Acts as a backwards-compatibility layer for the Next.js frontend.

---

## 🛠️ Tech Stack

### Frontend
*   **Next.js (App Router)** & React 19
*   **CSS / Vanilla CSS** with custom design system
*   **React Context API** for Shopping Bag state

### Backend & Headless CMS
*   **Strapi v5 Community Edition** (Catalog/Content Management)
*   **Node.js + Express** (Transactional Business Logic)
*   **PostgreSQL** (Shared database with `tx_` prefixed tables for Express transaction data)
*   **Redis** (Optional caching layer)

---

## 📁 Monorepo Structure

```
whoami-website/
├── apps/
│   ├── web/               # Next.js Frontend
│   └── cms/               # Strapi v5 CMS (with custom founder-dashboard plugin)
├── services/
│   └── api/               # Express Transactional API (Compatibility Layer)
├── scripts/               # Migration and database bootstrap scripts
├── .env.example           # Workspace environment example
├── package.json           # Workspace root package config
└── README.md              # Monorepo documentation
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v20 or higher recommended)
*   PostgreSQL running locally (e.g., `postgresql://postgres:postgres@localhost:5432/whoami`)

### Installation

1.  **Install Workspace Dependencies:**
    From the root directory, run:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Copy `.env.example` to `.env.local` in the root:
    ```bash
    cp .env.example .env.local
    ```
    Also configure local environment variables for the Next.js app:
    ```bash
    cp apps/web/.env.local apps/web/.env.local
    ```

3.  **Bootstrap the Strapi Database & Migrate Data:**
    If database schema is empty, run migration script to seed categories, products, combos, and blogs into Strapi:
    ```bash
    node scripts/migrate_to_strapi.js
    ```

4.  **Build the CMS Admin Panel:**
    Compile the Strapi typescript codebase and custom Founder Dashboard plugin:
    ```bash
    npm run build -w apps/cms
    ```

### Running the Application

To start all services concurrently (Frontend, Express API, Strapi CMS) in development mode:
```bash
npm run dev
```

The services will run on the following local addresses:
*   **Frontend (Next.js)**: `http://localhost:3000`
*   **Headless CMS (Strapi)**: `http://localhost:1337`
*   **Express API Backend**: `http://localhost:5001`

---

## 🌐 API Directory

### Express Transactional API (`http://localhost:5001/api/v1`)
*   `GET /products` - Get mapped product list (from Strapi)
*   `GET /products/:id` - Get single product detail
*   `GET /products/combos` - Get combo catalog
*   `POST /orders` - Place new order (updates stock in Strapi, inserts to `tx_orders` & `tx_inventory_transactions` in Postgres)
*   `POST /reviews` - Submit review
*   `POST /contact` - Submit contact form
*   `POST /newsletter/subscribe` - Newsletter subscription

---

## 📊 Founder Dashboard

Accessible within the Strapi Admin Panel (`http://localhost:1337/admin`). Provides the Founder with real-time operations overview directly from PostgreSQL and Strapi Document Services:
*   **Sales & Orders metrics**
*   **Low Stock Alerts** with email notification triggers
*   **Security & Operations Audit Logs**
*   **System Actions** (Cache invalidation, generating weekly reports)

---

**WhoAmI** - Identity, crafted. 🇮🇳 ✦
