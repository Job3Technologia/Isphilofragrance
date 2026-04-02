# ISPHILO FRAGRANCE - Shopify Premium Theme

A high-performance, luxury e-commerce theme for Isphilo Fragrance, fully optimized for the Shopify platform. This repository is structured for direct integration with Shopify via GitHub.

## 🚀 Key Features

- **Direct GitHub Sync**: Push changes to this repository and they will automatically update on your Shopify store.
- **Section-Based Design**: Modular homepage with customizable sections (Hero, Featured Products, Boutique Experience, About Preview, Why Choose Us, Newsletter).
- **Luxury UI/UX**: Preserved animations (reveal-on-scroll), custom typography (Montserrat & Cormorant Garamond), and premium styling.
- **AJAX Shopping Experience**: Real-time cart updates and "Add to Cart" functionality without page refreshes.
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices.
- **Shopify Native Functions**: Supports Shopify's built-in Search, Collections, Customer Accounts, and Checkout.

## 📂 Repository Structure (Shopify Standard)

```bash
/assets/             # CSS (style.css) and JavaScript (main.js)
/config/             # Theme settings and schema (settings_schema.json)
/layout/             # Main layout (theme.liquid)
/locales/            # Translation and label files (en.default.json)
/sections/           # Modular theme components (header, footer, hero, etc.)
/snippets/           # Reusable Liquid snippets (product-card, breadcrumbs, etc.)
/templates/          # Page templates (index, product, collection, page)
```

## 🔧 How to Connect to Shopify (GitHub Integration)

1.  **Commit and Push**: Ensure all files in this repository are pushed to your `main` branch.
2.  **Connect in Shopify Admin**:
    - Log in to your Shopify Admin.
    - Go to **Online Store** > **Themes**.
    - Click **Add Theme** > **Connect from GitHub**.
    - Select your GitHub account (`Job3Technologia`) and the repository (`Isphilofragrance`).
    - Select the `main` branch.
3.  **Automatic Recognition**: Shopify will now recognize the repository as a valid theme because the folders (layout, sections, etc.) are in the root directory.
4.  **Customize**:
    - Click **Customize** on the newly connected theme.
    - Use the Shopify Theme Editor to upload your high-quality brand images and assign collections.

## 🛡️ Security & Performance
- **Shopify CDN**: All assets and images are served via Shopify's global content delivery network.
- **SSL Secure**: Integrated SSL encryption for all pages and checkout.
- **Optimized Assets**: Minified CSS and asynchronous JavaScript for fast loading.

---
*Developed for Isphilo Fragrance - Est. 2018*
