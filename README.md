# BizPulse AI – Intelligent Business Operations Copilot

**An AI-powered business operations platform that helps small and medium-sized businesses manage, analyse and improve their business performance.**

<p align="center">
  <a href="https://bizpulse-ai-frontend.onrender.com">Live Demo</a> •
  <a href="https://github.com/saipravinya144-lab/BizPulse-AI">GitHub Repository</a>
</p>

---

## Overview

BizPulse AI is a full-stack business operations platform that combines business analytics with Generative AI.

It enables business owners to manage their daily operations, monitor performance, analyse customer feedback, generate marketing content and receive AI-powered business insights through a centralized dashboard.

The platform integrates a React frontend, Node.js and Express backend, MongoDB database and Google's Gemini AI.

## Live Application

- **Frontend:** https://bizpulse-ai-frontend.onrender.com
- **Backend:** https://bizpulse-ai-3xmi.onrender.com
- **Source Code:** https://github.com/saipravinya144-lab/BizPulse-AI

## Features

### 1. Authentication
- User registration and login.
- Password hashing and JWT-based authentication.
- Protected application routes.

### 2. Business Dashboard
- Overview of business performance.
- Total revenue and sales metrics.
- Product and inventory statistics.
- Revenue overview and AI-powered business insights.

### 3. Inventory Management
- Add, update and delete products.
- Monitor product prices and stock levels.
- Manage business inventory.

### 4. Sales Management
- Record and manage sales transactions.
- Import sales data through CSV files.
- Track revenue and sales performance.

### 5. Customer Feedback Analysis
- Collect and manage customer feedback.
- Analyse customer sentiment using Gemini AI.
- Identify positive and negative customer feedback.

### 6. AI Business Assistant
- Ask questions about business performance.
- Retrieve business context from stored data.
- Receive AI-generated answers and insights.

### 7. Marketing Studio
- Generate AI-powered marketing content.
- Create product-focused promotional content.
- Save and manage generated content history.

### 8. Business Reports
- View business performance reports.
- Analyse sales and revenue information.
- Export reports as PDF files.

### 9. Settings
- Manage user and business profile information.
- Update account settings.
- Change account password.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT, bcryptjs |
| Generative AI | Google Gemini API |
| CSV Processing | PapaParse |
| PDF Generation | jsPDF, jsPDF-AutoTable |
| Deployment | Render |
| Version Control | Git, GitHub |

## System Architecture

```text
              USER
                |
                v
       React + Vite Frontend
                |
                v
        Express.js Backend
                |
       +--------+--------+
       |        |        |
       v        v        v
    MongoDB   Gemini   JWT Auth
     Atlas      AI
       |        |
       +--------+
                |
                v
        Business Insights
```

## Project Structure

```text
BizPulse-AI/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   └── layout/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

Follow these instructions to run BizPulse AI locally.

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account or MongoDB connection
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/saipravinya144-lab/BizPulse-AI.git

cd BizPulse-AI
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend

npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Add the following variables with your own credentials:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Important:** Never commit `.env` files, database credentials, API keys or other secrets to GitHub.

### 5. Run the Backend

From the `backend` directory:

```bash
npm start
```

The backend will run at:

```text
http://localhost:5000
```

### 6. Run the Frontend

Open another terminal at the project root:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:5173
```

## Deployment

BizPulse AI is deployed using Render.

- **Frontend:** Render Static Site
- **Backend:** Render Web Service
- **Database:** MongoDB Atlas

The production frontend connects to the deployed backend through the `VITE_API_URL` environment variable.

## Future Enhancements

Potential improvements for future versions include:

- Advanced business forecasting.
- More detailed analytics and visualizations.
- Enhanced role-based access control.
- Automated business performance recommendations.
- Advanced reporting and data exports.

## Project Status

**Deployment: Live**

The core application modules have been implemented, integrated and functionally tested. The frontend and backend are deployed, with MongoDB Atlas connected.

## Author

Developed as a Generative AI and Full-Stack Development project.

**Project:** BizPulse AI  
**GitHub:** [saipravinya144-lab](https://github.com/saipravinya144-lab)

---

*BizPulse AI – Turning Business Data into Intelligent Decisions.*
