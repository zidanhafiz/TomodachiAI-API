# Tomodachi AI API

<div align="center">

<!-- ![Tomodachi AI Logo](path/to/logo.png) -->

[![Bun](https://img.shields.io/badge/Runtime-Bun-blue)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Framework-Hono-brightgreen)](https://hono.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Build and chat with your personalized AI companion - Voice calls included!

[Live Demo](https://tomodachiai-api.onrender.com) · [API Documentation](https://tomodachiai-api.onrender.com/v1/api-docs) · [Report Bug](https://github.com/zidanhafiz/TomodachiAI-API/issues)

</div>

## 📖 Table of Contents
- [Tomodachi AI API](#tomodachi-ai-api)
  - [📖 Table of Contents](#-table-of-contents)
  - [🌟 Features](#-features)
  - [🚀 Tech Stack](#-tech-stack)
  - [📋 Prerequisites](#-prerequisites)
  - [🚀 Getting Started](#-getting-started)
  - [🐳 Docker Setup](#-docker-setup)
    - [Development Environment](#development-environment)
    - [Production Environment](#production-environment)
    - [Services \& Ports](#services--ports)
  - [📚 API Documentation](#-api-documentation)
    - [Authentication](#authentication)
    - [Companions](#companions)
    - [Chat \& Voice](#chat--voice)
  - [💻 Development](#-development)
    - [Local Setup](#local-setup)
    - [File Structure](#file-structure)
  - [🧪 Testing](#-testing)
  - [📦 Deployment](#-deployment)
    - [Render](#render)
    - [Docker (Production)](#docker-production)
  - [🤝 Contributing](#-contributing)
  - [📝 License](#-license)
  - [👥 Contact](#-contact)
  - [🙏 Acknowledgments](#-acknowledgments)

## 🌟 Features

- 🤖 **Custom AI Companions**
  - Create personalized AI companions with unique personalities
  - Choose from various roles (Assistant, Friend, Partner)
  - Customize appearance and voice
- 💬 **Advanced Chat Features**
  - Real-time messaging with WebSocket support
  - Message history tracking
  - Smart context management
- 🎙️ **Voice Integration**
  - Text-to-Speech using ElevenLabs
  - Natural voice conversations
  - Multiple voice options
- 🔒 **Security**
  - JWT-based authentication
  - Role-based access control
  - Secure API endpoints
- ⚡ **High Performance**
  - Built with Bun runtime
  - Redis caching
  - PostgreSQL for data persistence

## 🚀 Tech Stack

- **Runtime & Framework**
  - [Bun](https://bun.sh) - Ultra-fast JavaScript runtime
  - [Hono](https://hono.dev) - Lightweight web framework
  - [TypeScript](https://www.typescriptlang.org) - Type-safe code
- **Database & Caching**
  - [PostgreSQL](https://www.postgresql.org) - Primary database
  - [Redis](https://redis.io) - Caching and queue management
  - [Prisma](https://www.prisma.io) - ORM
- **AI Services**
  - [OpenAI](https://openai.com) - Chat completions (GPT-4)
  - [ElevenLabs](https://elevenlabs.io) - Voice synthesis
- **DevOps**
  - [Docker](https://www.docker.com) - Containerization
  - [Docker Compose](https://docs.docker.com/compose/) - Multi-container management

## 📋 Prerequisites

- Docker >= 24.0.0
- Docker Compose >= 2.21.0
- Bun >= 1.0.0 (for local development)
- OpenAI API Key
- ElevenLabs API Key

## 🚀 Getting Started

1. **Clone the repository**
```sh
git clone https://github.com/zidanhafiz/TomodachiAI-API.git
cd TomodachiAI-API
```

2. **Set up environment variables**
```sh
cp .env.example .env
```

3. **Configure environment variables**
```env
# Application
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tomodachi
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tomodachi
DOCKER_DATABASE_URL=postgresql://postgres:postgres@db:5432/tomodachi

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## 🐳 Docker Setup

### Development Environment
```sh
# Start development services
docker compose -f compose.dev.yml up -d

# View logs
docker compose -f compose.dev.yml logs -f

# Stop services
docker compose -f compose.dev.yml down
```

### Production Environment
```sh
# Build and start production services
docker compose -f compose.prod.yml up -d --build

# View logs
docker compose -f compose.prod.yml logs -f

# Stop services
docker compose -f compose.prod.yml down
```

### Services & Ports
- **API**
  - Development: `http://localhost:4000`
  - Production: `http://localhost:3000`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **RedisInsight** (Dev only): `http://localhost:8001`

## 📚 API Documentation

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Companions
```http
POST /api/agents/create
GET /api/agents
GET /api/agents/:id
PATCH /api/agents/:id
DELETE /api/agents/:id
```

### Chat & Voice
```http
POST /api/chat/message
GET /api/chat/history
POST /api/voice/synthesize
```

Detailed API documentation available at `/v1/api-docs` when running the server.

## 💻 Development

### Local Setup
```sh
# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# Start development server
bun run dev
```

### File Structure
```
src/
├── models/     # Database models
├── routes/     # API routes
├── middlewares/# Custom middlewares
├── utils/      # Utility functions
└── workers/    # Background workers
```

## 🧪 Testing

```sh
# Run all tests
bun test

# Run specific test file
bun test test/api/users.test.ts
```

## 📦 Deployment

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Docker (Production)
1. Build the image:
```sh
docker compose -f compose.prod.yml build
```

2. Deploy:
```sh
docker compose -f compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

Instagram - [@hafizrofiyani](https://instagram.com/hafiz.rofiyani)

## 🙏 Acknowledgments

- [Bun](https://bun.sh)
- [Hono](https://hono.dev)
- [OpenAI](https://openai.com)
- [ElevenLabs](https://elevenlabs.io)