# Protech_Vmine# 🚀 Protech — Full-Stack E-Commerce Platform

**Built with:** Flask (Backend) | React.js (Frontend) | MySQL Database | Third-party APIs

---

## 📋 Project Overview

Protech is a complete e-commerce solution built from scratch, featuring secure payment processing, real-time order tracking, and AI-powered customer support. This project demonstrates end-to-end fullstack development with production-ready code.

### 🎯 Key Features

✅ **Product Catalog** — Browse and search products with filtering  
✅ **Shopping Cart & Checkout** — Complete transaction flow  
✅ **PayPal Integration** — Secure payment processing  
✅ **AI Chatbot** — ChatGPT-powered customer support  
✅ **Real-time Order Tracking** — Google Maps integration  
✅ **User Authentication** — JWT with role-based access control (Admin, Customer)  
✅ **Responsive Design** — Mobile-first approach  
✅ **Admin Dashboard** — Inventory & sales management  

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Flask (Python)
- **ORM:** SQLAlchemy
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **External APIs:** PayPal, OpenAI (ChatGPT), Google Maps

### Frontend
- **Library:** React.js
- **Styling:** Bootstrap + CSS3
- **State Management:** Context API
- **HTTP Client:** Fetch API / Axios

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway or Render
- **Database:** MySQL (Cloud hosted)

---

## 🚀 Getting Started Locally

### Prerequisites
You'll need:
- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- Git

### Backend Setup

Clone this repository
git clone https://github.com/Jaime-Gutierrez-19/protech-ecommerce
cd protech-ecommerce

Create virtual environment
python -m venv venv

Activate virtual environment
On Linux/Mac:
source venv/bin/activate

On Windows:
venv\Scripts\activate

Install dependencies
pip install -r requirements.txt

Create .env file with your configuration
cp .env.example .env

Edit .env with your database credentials and API keys
Run database migrations
flask db upgrade

Start Flask server
flask run

Backend will run on http://localhost:5000


### Frontend Setup

In another terminal, navigate to frontend folder (if separate)
OR if React is in the same folder:
npm install

Create .env file
cp .env.example .env.local

Add: REACT_APP_API_URL=http://localhost:5000
Start React development server
npm start

Frontend will run on http://localhost:3000

### Database Setup

Create database
mysql -u root -p
mysql> CREATE DATABASE protech_db;
mysql> EXIT;

Run migrations
flask db upgrade


---

## 📁 Project Structure

protech-ecommerce/
├── backend/
│ ├── app.py # Flask app entry point
│ ├── config.py # Configuration
│ ├── requirements.txt # Python dependencies
│ ├── models/ # Database models
│ ├── routes/ # API endpoints
│ ├── middleware/ # Authentication, CORS
│ └── migrations/ # Database migrations
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── pages/ # Page components
│ │ ├── services/ # API calls
│ │ ├── context/ # State management
│ │ └── App.js # Main app
│ ├── package.json
│ └── .env.example
├── README.md
├── .gitignore
└── .env.example


---

## 🔌 API Endpoints

### Products
- `GET /api/products` — Get all products
- `GET /api/products/<id>` — Get product details
- `POST /api/products` — Create product (Admin only)
- `PUT /api/products/<id>` — Update product (Admin only)
- `DELETE /api/products/<id>` — Delete product (Admin only)

### Orders
- `POST /api/orders` — Create order
- `GET /api/orders/<id>` — Get order details
- `GET /api/orders/user/<user_id>` — Get user orders
- `PUT /api/orders/<id>` — Update order status (Admin)

### Authentication
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login (returns JWT)
- `POST /api/auth/logout` — User logout

### Payments
- `POST /api/payments/paypal-order` — Create PayPal order
- `POST /api/payments/paypal-capture` — Capture PayPal payment

### AI Chatbot
- `POST /api/chat` — Send message to ChatGPT chatbot
- `GET /api/chat/history` — Get chat history

---

## 🧪 Testing

Backend (using Postman or curl)
curl -X GET http://localhost:5000/api/products

Frontend (automatic with React)
npm test


---

## 📊 Database Schema

### Users Table
CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role ENUM('customer', 'admin') DEFAULT 'customer',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


### Products Table

CREATE TABLE products (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
price DECIMAL(10, 2) NOT NULL,
stock INT DEFAULT 0,
image_url VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


### Orders Table
CREATE TABLE orders (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
total DECIMAL(10, 2) NOT NULL,
status ENUM('pending', 'paid', 'shipped', 'delivered') DEFAULT 'pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);


---

## 🎓 What I Learned

- ✅ Full-stack web development from scratch
- ✅ RESTful API design and best practices
- ✅ Third-party API integration (PayPal, OpenAI, Google Maps)
- ✅ Database design and normalization (MySQL)
- ✅ User authentication with JWT
- ✅ State management in React (Context API)
- ✅ Production deployment (Vercel + Railway/Render)
- ✅ Secure payment processing (PCI compliance basics)

---

## 🤝 Collaboration

This project was developed as part of **4Geeks Academy Bootcamp** with guidance and best practices from the instructors and community.

**Team members:**
- Jaime Gutierrez — Backend API & Database Design


---

## 📞 Contact & Links

📧 **Email:** jega190112@gmail.com  
🔗 **LinkedIn:** [linkedin.com/in/jaime-gutierrez-012b59318/](https://linkedin.com/in/jaime-gutierrez-012b59318/)  
💻 **GitHub:** [github.com/Jaime-Gutierrez-19](https://github.com/Jaime-Gutierrez-19)  
🎯 **Upwork:** [Coming Soon]  

---

## 📜 License

This project is open source and available under the MIT License.

---

**Last Updated:** November 2025  
**Status:** Production Ready ✅

