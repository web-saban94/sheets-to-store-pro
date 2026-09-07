# H. Saban Digital Showroom

Act as an expert Full-Stack Developer & UI/UX Architect. Build a complete, production-ready luxury e-commerce and CRM web application for "ח. סבן חומרי בניין (1994) בע״מ" optimized for deployment on Vercel, utilizing Google Sheets as a fully automated headless database and CRM backend via a comprehensive Google Apps Script (Code.gs) script.

Core Architecture & Visual Design:

Color Palette (Derived from Logo): Deep Industrial Slate Backgrounds (#0F172A), Corporate Trust Blue Accents (#0284C7 / #0369A1), and Clean Platinum/White UI elements for a premium, high-end look with professional framed borders for images and product cards.

Responsive Layout: 100% Mobile-First dynamic design featuring a sleek Mobile Hamburger Drawer navigation for multi-layered page access and details.

Luxury Homepage Experience:

Hero Section with an immersive Auto-Rotating Image Carousel.

Action buttons on slides (e.g., "כניסה לקטגוריית חומרי בניין") for instant category filtering.

Key Advanced Features & Modules:

Noah-AI Chatbot (נועה-AI) Popup:

Floating interactive chat assistant widget powered by a popup button.

Provides full-Hebrew assistance for customer service, product matching, operating hours (סניף התלמיד 6 הוד השרון, סניף החרש 10), and technical consultation.

Connected to a backend conversation logging system.

Advanced Product Cards & Catalog:

Rich product cards displaying product images, technical presentations, drying time, coverage per square meter (מ"ר), and application method (שיטת יישום).

Smart Shopping Cart & Google Sheets Order Injection:

Full cart management aggregating all items, delivery/crane options, and coupon codes.

Instantly injects orders online to Google Sheets and retrieves confirmation responses.

Secure Customer Portal & CRM:

Secure login / client creation interface.

Full CRM tracking managed behind the scenes in Google Sheets.

Backend Administration & Google Apps Script (Code.gs):

The generated Code.gs must be complete and include automated setup functions to create all required database tabs (Products, Categories, Brands, Orders, CRM Customers, Chat Logs, Rulebook).

Manages catalog items, brand logos, weekly product promotions, and conversation logs.

Deliverables:

Complete, production-ready Google Apps Script (Code.gs) handling all GET/POST requests, database setup, and CRM/catalog synchronization.

Complete, functional Next.js/React code files implementing the luxury UI, product catalog, smart cart, popup Noah-AI chat, and secure customer portal.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c95fad74-7364-4e96-8d80-8fc446c8e116).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
