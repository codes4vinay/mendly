# RPAR - Repair Services Platform

## 🎯 Problem Statement

In today's fast-paced world, finding reliable and efficient repair services for everyday items—whether electronics, appliances, or other utilities—is a challenge. Users often face issues like:

- ❌ Unverified service providers
- ❌ Inconsistent pricing
- ❌ Lack of transparency
- ❌ Poor service tracking
- ❌ Limited options and communication

## 💡 Solution

**RPAR** bridges this gap by creating a one-stop digital platform that connects users with verified repair professionals, ensuring trust, efficiency, and convenience. The platform streamlines the repair process, enabling customers to book services, track progress, and provide feedback, while service providers gain access to a broader customer base.

By leveraging technology, RPAR enhances the repair experience for both users and service providers, fostering a community of trust and reliability in the repair industry.

---

## ✨ Key Features

### For Users

- 📅 **Easy Booking** - Schedule repairs in minutes
- 💳 **Secure Payments** - Multiple payment options via Razorpay
- 📍 **Service Locator** - Find nearby service centers
- 📝 **Order Tracking** - Real-time service status updates
- ⭐ **Reviews & Ratings** - Verified customer feedback
- 💬 **Live Chat** - Connect with service providers
- 🤖 **AI Assistant** - 24/7 RPAR chatbot for support

### For Service Providers

- 📊 **Dashboard** - Manage bookings and orders
- 👥 **Customer Management** - Track client interactions
- 💰 **Revenue Analytics** - Monitor earnings
- 📱 **Mobile App** - Work on the go
- 🔔 **Notifications** - Real-time booking alerts

---

## 🛠 Tech Stack

### Frontend

- **React.js** - UI framework
- **Redux** - State management
- **Vite** - Build tool
- **Socket.IO** - Real-time communication
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Groq LLM** - AI chatbot
- **Pinecone** - Vector database for RAG
- **Razorpay** - Payment processing

### AI & ML

- **Groq SDK** - Language model API
- **LangChain** - LLM framework
- **Hugging Face Transformers** - Free local embeddings
- **Pinecone** - Vector search

---

## 📁 Project Structure

```
rpar/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Feature modules (auth, chat, chatbot, notification)
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   ├── utils/              # Utility functions
│   │   └── App.jsx
│   └── package.json
│
├── backend/                    # Express backend server
│   ├── controllers/            # Request handlers
│   ├── models/                 # Database schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── utils/                  # Helper functions
│   ├── config/                 # Configuration files
│   ├── docs/                   # Documentation
│   ├── server.js               # Entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/rpar.git
cd rpar
```

**2. Backend Setup**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

**3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/rpar

# Authentication
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_secret_key

# Third-party Services
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key

# AI & Chatbot
GROQ_API_KEY=your_groq_api_key
EMBEDDING_PROVIDER=local-hash
EMBEDDING_MODEL=rpar-local-embedding-v1
EMBEDDING_DIMENSION=1536
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=rpar-chatbot-index

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

If you are switching from Azure embeddings to the local `rpar-local-embedding-v1` setup, make sure your Pinecone index dimension matches `1536`. If your old index or namespace was created for earlier embeddings, re-index the chatbot documentation after restarting the backend.

---

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Booking Endpoints

- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Chatbot Endpoints

- `POST /api/chatbot/new` - Start conversation
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/conversation/:id` - Get conversation history

For complete API documentation, see [backend/docs/rpar-documentation.txt](backend/docs/rpar-documentation.txt)

---

## ✅ Code Quality

✅ **No compiler errors**  
✅ **No runtime errors**  
✅ **All tests passing**  
✅ **ESLint configured**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Support

For support, email us at **vinay@vinaydev.in** or visit our website at **rpar.vinaydev.in**

---

## 👥 Team

Built with ❤️ by Vinay Kumar

---

**Last Updated:** April 2, 2026
