# 🛋️ FurniNest — Modern Furniture E-Commerce & Operations Platform

> A full-stack enterprise e-commerce platform for handcrafted furniture built with **.NET 10 Web API**, **Entity Framework Core (SQLite)**, and **Angular 21 (Signals & Standalone Components)**.

---

## 🌟 Key Features

### 🛒 1. Customer Storefront
* **Curated Catalog:** Browse by rooms (*Living Room, Bedroom, Dining Room, Home Office*), price range, search query, or sorting criteria with calibrated realistic prices and distinct photography.
* **Product Details:** High-resolution photography, piece dimensions (*H × W × D*), sustainably sourced materials, and stock availability.
* **Verified Customer Reviews with Photos:** Real customer review submission with attached product photos, preset photo selectors, and full-resolution lightbox viewer.
* **Smart Shopping Bag:** Live quantity stepper, subtotal calculation, 5% handicraft GST breakdown, and dynamic progress bar for **Free White-Glove Delivery** (unlocked at ₹25,000+).
* **Flexible 2-Step Checkout:** Support for both **💳 Credit/Debit Card** and **💵 Cash on Delivery (COD)** with zero advance payment required.
* **Self-Service Order Cancellation:** Cancel orders prior to dispatch with customizable reason tracking, automated stock replenishment, and payment refund/void status.
* **Live Order Fulfillment Tracker:** Real-time visual progress stepper:
  `Order Placed` ➔ `In Crafting (Wood Joinery)` ➔ `Quality Inspection` ➔ `Dispatched / Shipped` ➔ `Delivered`.
* **Client Orders Dashboard:** Complete order history with courier tracking links, GST tax invoice modals, and device passkey management.
* **Account Security & Password Recovery:** Secure password login, passwordless Email OTP, WebAuthn biometric passkeys, and self-service **Forgot Password with 6-digit OTP verification**.

### 🛡️ 2. Admin Operations Desk
* **Business KPIs:** Real-time Gross Revenue, Total Orders, Active Customers, and Low-Stock Warnings.
* **Fulfillment Management:** Change order statuses inline (`Placed` ➔ `InCrafting` ➔ `QualityCheck` ➔ `Shipped` ➔ `Delivered`), assign courier tracking numbers (*e.g., FedEx, DHL*), and cancel orders with automatic inventory restocking.
* **Inventory Control:** Add new furniture pieces with dimensions, materials, and pricing; archive discontinued pieces from the catalog.

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** (Sarah) | `customer@furninest.com` | `Customer@123` | Storefront, Cart, Checkout, Order Tracking |
| **Store Admin** | `admin@furninest.com` | `Admin@123` | Operations Dashboard, Fulfillment, Inventory |

*(Tip: The Sign In page has 1-click **"Fill Customer"** and **"Fill Admin"** buttons for instant demo testing!)*

---

## 🚀 How to Run

### Step 1: Start the Backend (.NET Web API)
```powershell
cd d:\boost\FurniNest\backend
dotnet run
```
* **API URL:** `http://localhost:5000`
* **Swagger/OpenAPI:** `http://localhost:5000/openapi/v1.json`
* **Database:** Automatically initializes and seeds `furninest.db` on first run.

### Step 2: Start the Frontend (Angular 21)
```powershell
cd d:\boost\FurniNest\frontend
npm start
```
* Open your browser at: **`http://localhost:4200`**

---

## 🏛️ Architecture & Technologies

### Backend (`/backend`)
* **Framework:** ASP.NET Core 10 Web API (Controllers)
* **Database:** Entity Framework Core with SQLite (zero setup required)
* **Security:** JWT Bearer Authentication with role-based policies (`Customer` vs `Admin`) & BCrypt password hashing
* **CORS:** Pre-configured for Angular development (`http://localhost:4200`)

### Frontend (`/frontend`)
* **Framework:** Angular 21 Standalone Components
* **State Management:** Modern Angular Signals (`signal()`, `computed()`)
* **Design System:** Custom luxury furniture theme with Google Fonts (*Playfair Display* & *Plus Jakarta Sans*)
* **Guards & Interceptors:** `authInterceptor` (automatic JWT injection) and `authGuard` / `adminGuard` route protection

