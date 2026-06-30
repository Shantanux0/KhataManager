# KhataManager - Project Idea & Vision

## 📖 Overview
**KhataManager** is a digital ledger application designed to replace the traditional, paper-based "Khata" (ledger book) used by millions of small businesses, shopkeepers, freelancers, and individuals worldwide. 

The core idea is to provide a simple, reliable, and secure platform to track daily transactions, manage customer credits/debits, and maintain a clear picture of one's financial standing without the hassle of manual calculations.

## 🛑 The Problem
In many developing and even developed economies, small-scale businesses and independent service providers operate heavily on trust and informal credit. They typically record what a customer owes ("Given") and what a customer pays back ("Got") in physical notebooks. 
This traditional approach has several major drawbacks:
- **Risk of Data Loss:** Physical books can be lost, stolen, or damaged by water and fire.
- **Manual Errors:** Calculating total outstanding balances across pages of messy handwriting often leads to miscalculations and lost revenue.
- **Lack of Insights:** It is incredibly difficult to get a quick overview of total cash flow, total money owed by all customers, or daily transaction volumes.
- **Time Consuming:** Finding a specific customer's history means flipping through hundreds of pages.

## 💡 The Solution: KhataManager
KhataManager digitizes this entire process while keeping the user experience as simple and intuitive as writing in a notebook. It empowers users to:
1. **Digitize Customer Records:** Add customers and maintain an individualized digital ledger for each one.
2. **Track "Given" & "Got":** Easily record every time money/goods are given on credit, and every time a payment is received.
3. **Automated Calculations:** The app instantly calculates the net balance for each customer and the overall business.
4. **Data Security & Cloud Sync:** Because the data is stored on a secure backend database, users never have to worry about losing their ledger.
5. **Analytics at a Glance:** A comprehensive dashboard provides visual insights into total receivables, total payables, and daily transaction trends.

## 🎯 Target Audience
- **Kirana / Grocery Store Owners:** To manage daily tabs of regular neighborhood customers.
- **Freelancers & Independent Contractors:** To track pending payments from different clients.
- **Wholesalers & Distributors:** To maintain credit records for the retailers they supply.
- **Individuals:** To track personal loans or shared expenses with friends and family.

## 🚀 Key Conceptual Features
- **The Dashboard:** A bird's-eye view of the business. Shows "Total Given" (money out in the market), "Total Got" (money received), and the net balance.
- **Customer Profiles:** Dedicated pages for each customer showing their complete transaction history and current outstanding balance.
- **Daily Book (Daybook):** A chronological feed of all transactions that happened on a specific day, helping shopkeepers tally their cash drawer at the end of the day.
- **Quick Add:** A frictionless way to immediately log a transaction without navigating through multiple menus.
- **Secure Authentication:** Ensuring that sensitive financial data is only accessible to the business owner.

## 🔮 Future Roadmap (Potential Enhancements)
- **WhatsApp/SMS Reminders:** Automated or one-click reminders to customers about their pending dues.
- **PDF Reports:** Generate and download monthly statements for customers.
- **Multi-language Support:** To cater to regional business owners who prefer operating in their native language.
- **Offline Mode:** Allowing shopkeepers to record transactions even when their internet connection drops, syncing to the cloud later.

## 🚂 Railway Deployment
This project is fully configured to be deployed on [Railway](https://railway.app/). Since it's a monorepo, you will need to create two separate services in your Railway project.

### 1. Database Setup on Railway
- Go to your Railway project dashboard.
- Click **New** -> **Database** -> **Add PostgreSQL**.
- Railway will automatically provision a Postgres database and expose environment variables (like `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`).

### 2. Backend Service Deployment
- Click **New** -> **GitHub Repo** and select this repository.
- Go to the Settings of the newly created service.
- Set the **Root Directory** to `/backend`.
- Railway will automatically detect the Spring Boot `pom.xml` and build the project.
- The `application.properties` is already configured to automatically consume Railway's Postgres environment variables. No extra environment variables are needed!
- Ensure you set a `JWT_SECRET` environment variable in the backend service variables for secure token generation.

### 3. Frontend Service Deployment
- Click **New** -> **GitHub Repo** and select this repository again.
- Keep the **Root Directory** as `/` (default).
- Railway will detect the `package.json`, build the Vite React app, and serve it automatically using the `start` script we configured.
- (Optional) If you connect the frontend to the backend in the future, add your backend's Railway URL as an environment variable (e.g., `VITE_API_URL`) in the frontend service settings.
