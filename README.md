# MyMental Platform - Mental Health Pre-Counseling Chatbot

A comprehensive mental health platform featuring an AI-powered chatbot, emotional check-ins, and counselor handoff functionality. Built with Next.js (TypeScript), Django, PostgreSQL, and LangChain with Ollama.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Run](#run)
- [API](#api)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Remaining Work](#remaining-work)

## ✨ Features

- **AI-Powered Chatbot**: Conversations using LangChain with Ollama (free LLM)
- **Emotional Check-ins**: Track mood and emotional patterns over time
- **Crisis Detection**: Automatic detection and escalation of high-risk situations
- **Psychoeducation**: Access to coping strategies and mental health resources
- **Counselor Handoff**: Seamless transition to professional counselors with conversation summaries
- **Real-time WebSocket Support**: Live chat functionality
- **Privacy-First**: Anonymous mode and secure data handling

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **App Router** architecture

### Backend
- **Django 5.2** with Django REST Framework
- **PostgreSQL** database
- **Channels** for WebSocket support
- **Redis** for channel layers

### AI/ML
- **LangChain** for AI orchestration
- **Ollama** for local LLM inference (Llama 3.2)
- **Custom crisis detection** algorithms

## 🔍 Decision-Making Logic (Overview)

The chatbot’s core decision-making flow is implemented in the `backend/chatbot` app:

- Incoming messages are analyzed by a **keyword + severity crisis detector** (`CrisisKeyword`, `CrisisAlert`, and `MentalHealthChatbot.detect_crisis`).
- User mood history is modeled via **emotional check-ins** (`EmotionalCheckIn`), using simple averages and negative‑mood ratios over a time window.
- These signals are combined into a **three-level risk score** (low, moderate, high) with clear, rule-based thresholds and human‑readable rationales.
- The frontend chat page (`frontend/app/chat/page.tsx`) displays both the bot reply and a compact summary of the current risk assessment to the user.

## 📁 Project Structure

```
MyMental-Platform/
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── page.tsx       # Home page
│   │   ├── chat/          # Chat interface
│   │   └── check-in/      # Emotional check-in
│   └── package.json
├── backend/                # Django application
│   ├── users/             # User authentication & profiles
│   ├── chatbot/           # Chatbot logic & models
│   ├── counselor/         # Counselor dashboard
│   ├── mymental_backend/  # Django settings
│   └── requirements.txt
└── README.md
```

## 🏠 Homepage Structure

The homepage (`frontend/app/page.tsx`) is organized into the following sections:

### 1. **Responsive Header** (`ResponsiveHeader` component)
   - Fixed top navigation bar
   - Logo and brand name (MYMENTAL)
   - Navigation links: Home, About, Services, ChatBot
   - Authentication buttons (Login/Logout)
   - "Start Support" CTA button
   - Responsive hamburger menu for mobile devices

### 2. **Hero Slider Section** (`#home`)
   - Full-width image carousel with 3 slides
   - Auto-rotating slides every 4 seconds
   - Smooth fade transitions with scale effect
   - Slider indicator dots at the bottom
   - Responsive height calculation based on header

### 3. **About Section** (`#about`)
   - Background image with overlay
   - Logo and brand name with gradient text
   - Descriptive text about MyMental Chat Bot
   - "Read more →" button linking to `/about` page
   - Responsive layout with absolute positioning

### 4. **Did You Know Section**
   - Section title in purple
   - Grid of 3 informational image cards
   - Responsive grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
   - Hover scale effect on cards
   - Images: `did you know 1.jpg`, `did you know 2.jpg`, `did you know 3.png`

### 5. **Services Section** (`#services`)
   - Section title in blue
   - Grid of 5 service cards:
     - **DEPRESSION**: Information about depression support
     - **ADDICTION**: Addiction services and rehabilitation
     - **CAREER**: Career services and job placement
     - **RELATIONSHIPS**: Relationship counselling
     - **FINANCIAL**: Financial counselling
   - Each card links to `/services/{service-name}`
   - Responsive layout: 1 column (mobile), 2 columns (tablet), 5 columns (desktop)
   - Hover scale effect on cards

### 6. **Footer** (`Footer` component)
   - Three-column layout:
     - **Left Column**: "MyMental" - Description of the platform
     - **Middle Column**: "Quick Links" - Navigation links (Home, About Us, Services, ChatBot)
     - **Right Column**: "Let Us Contact You" - Email input, "Reach out" button, social media icons
   - Bottom copyright bar
   - Full-width dark background
   - Responsive: Stacks vertically on mobile

## 🔧 Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **Python** (v3.10 or higher)
3. **PostgreSQL** (v14 or higher)
4. **Redis** (v7 or higher)
5. **Ollama** (for AI functionality)

### Installing Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download the model
ollama pull llama3.2
```

## 📦 Setup

### 1. Clone and Setup Repository

```bash
cd MyMental-Platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (minimum)
cat > .env << EOF
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=mymental_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
# Redis / Sentry (optional)
REDIS_URL=redis://127.0.0.1:6379/1
SENTRY_DSN=
ENVIRONMENT=development
# Ollama (optional for local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EOF

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb mymental_db

# Or using SQL:
psql -U postgres
CREATE DATABASE mymental_db;
```

## 🚀 Run

### Start Redis (Required for websockets & caching)

```bash
redis-server
```

### Start Ollama (Required for AI)

```bash
ollama serve
```

### Start Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Access Django Admin

Visit: `http://localhost:8000/admin`

## 🔌 API

### Chatbot Endpoints

- `POST /api/chatbot/start/` - Start a new conversation
- `POST /api/chatbot/send/` - Send a message
- `GET /api/chatbot/<session_id>/` - Get conversation history
- `GET /api/chatbot/list/` - List all conversations
- `GET /api/chatbot/search?q=...&scope=psycho|conversations|all` - Full-text search
- Reporting & moderation:
  - `POST /api/chatbot/report/`
  - `GET /api/chatbot/reports/`
  - `POST /api/chatbot/reports/<id>/handle/`

### Check-in Endpoints
- Notifications
  - `POST /api/chatbot/notifications/register/`
  - `DELETE /api/chatbot/notifications/unregister/`
  - `GET /api/chatbot/notifications/devices/`
  - `GET /api/chatbot/notifications/preferences/`
  - `PUT /api/chatbot/notifications/preferences/update/`
  - `POST /api/chatbot/notifications/test/`

- `POST /api/chatbot/check-in/create/` - Create emotional check-in
- `GET /api/chatbot/check-in/list/` - Get check-in history

### WebSocket

- `ws://localhost:8000/ws/chatbot/<session_id>/` - Real-time chat

## ⚙️ Configuration

### Environment Variables (Backend)

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=mymental_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
# Redis / Sentry
REDIS_URL=redis://127.0.0.1:6379/1
SENTRY_DSN=
ENVIRONMENT=development
# Ollama (optional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Frontend Configuration

The frontend expects the backend API at `http://localhost:8000`. Update API URLs in components if needed.

## 🐛 Troubleshooting

### Issue: Cannot connect to database

**Solution**: Ensure PostgreSQL is running:
```bash
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
```

### Issue: Ollama not responding

**Solution**: Check if Ollama is running:
```bash
ollama serve
# Test with: curl http://localhost:11434/api/tags
```

### Issue: Redis connection error

**Solution**: Start Redis server:
```bash
redis-server
```

### Issue: Port already in use

**Solution**: Change ports in respective configuration files or kill the process:
```bash
# Django (port 8000)
lsof -ti:8000 | xargs kill

# Next.js (port 3000)
lsof -ti:3000 | xargs kill
```

## 🧭 Remaining Work
See `FEATURES.md` for a concise, prioritized list. Highlights:
- Service pages polish
- Production deployment (domain, SSL, Docker, secrets)
- E2E tests and load tests
- Monitoring dashboards and alerts

## 🔒 Security Considerations

- All API endpoints require authentication
- Sensitive data is encrypted
- Crisis keywords trigger immediate escalation
- User data follows HIPAA guidelines (configure for production)

## 📄 License

This project is for educational purposes. Ensure compliance with local regulations before deploying to production.

## 🤝 Contributing

This is a closed project. For improvements, please contact the development team.

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review Django and Next.js documentation
- Ensure all prerequisites are installed correctly

---

**⚠️ IMPORTANT**: This is NOT a substitute for professional mental health care. For emergencies, contact:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Your local emergency services: 911

