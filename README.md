# KhataManager

KhataManager is a modern, full-stack ledger management (Khata) application designed for businesses and individuals to easily keep track of their daily transactions, customers, and financial analytics. It replaces traditional paper-based bookkeeping with a digital, secure, and user-friendly solution.

## 🚀 Features

- **User Authentication**: Secure user registration and login using JWT.
- **Dashboard & Analytics**: Visual overview of your financials (total given, total got, balance) with interactive charts.
- **Customer Management**: Add, view, and manage your customers.
- **Transaction Tracking**: Record "Given" (Credit) and "Got" (Debit) transactions for each customer.
- **Daily Book**: View day-by-day summaries of all your transactions.
- **Responsive Design**: Beautiful, modern UI built with Tailwind CSS that works seamlessly across devices.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI library for building user interfaces.
- **Vite**: Next-generation, fast frontend tooling.
- **Tailwind CSS**: Utility-first CSS framework for rapid and beautiful styling.
- **Recharts**: Composable charting library built on React components.
- **React Router**: Declarative routing for React.
- **Lucide React**: Beautiful and consistent icons.

### Backend
- **Spring Boot**: Robust Java-based framework for backend development.
- **Spring Security & JWT**: Comprehensive security and authentication mechanism.
- **Spring Data JPA**: Abstraction layer for interacting with the database.
- **PostgreSQL**: Powerful, open-source object-relational database system.
- **Maven**: Dependency management and build automation.

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Java Development Kit (JDK) 17](https://adoptium.net/) or higher
- [Maven](https://maven.apache.org/) (Optional, since `mvnw` wrapper is included)
- [PostgreSQL](https://www.postgresql.org/)

## ⚙️ Getting Started

### 1. Database Setup

1. Make sure PostgreSQL is running on your machine.
2. Create a new database named `khatamanager`:
   ```sql
   CREATE DATABASE khatamanager;
   ```
3. Update the database credentials in `backend/src/main/resources/application.properties` if your PostgreSQL username/password differ from the defaults:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/khatamanager
   spring.datasource.username=postgres
   spring.datasource.password=password
   ```

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build and run the Spring Boot application using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend server will start on `http://localhost:8082`.*

### 3. Frontend Setup

1. Open a new terminal and navigate to the project root directory:
   ```bash
   cd khataManager
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will typically be available at `http://localhost:5173`.*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
