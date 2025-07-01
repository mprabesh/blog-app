# 📝 Blog Application

A modern, full-stack blog application built with React frontend and Node.js backend, featuring containerized deployment with runtime environment variable injection for maximum flexibility across different environments.

## 🏗️ Architecture

### Main Stack (Docker Compose)
```
┌─────────────────┐    HTTP API calls    ┌─────────────────┐
│   Frontend      │ ───────────────────► │    Backend      │
│   (React/nginx) │                      │ (Node.js/Express)│
│   Port: 3001    │                      │   Port: 8081    │
└─────────────────┘                      └─────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │   MongoDB Atlas │
                                         │   (Cloud DB)    │
                                         └─────────────────┘
```

### Standalone Frontend (Independent Deployment)
```
┌─────────────────┐    HTTP API calls    ┌─────────────────┐
│   Frontend      │ ───────────────────► │   Remote API    │
│ (Standalone)    │                      │ (Any Backend)   │
│   Any Port      │                      │   Any URL       │
└─────────────────┘                      └─────────────────┘
```

## 🚀 Features

- **User Authentication**: Register, login, and JWT-based session management
- **Blog Management**: Create, read, update, and delete blog posts
- **Responsive UI**: Modern React interface with responsive design
- **RESTful API**: Clean API architecture with proper HTTP methods
- **Containerized Deployment**: Multiple deployment options:
  - Full stack with Docker Compose
  - Standalone frontend for independent deployment
- **Runtime Environment Injection**: Configure API endpoints at container startup
- **Production Ready**: Optimized builds with security best practices
- **Testing**: Comprehensive unit tests and E2E testing
- **CI/CD Ready**: Docker images perfect for continuous deployment

## 📁 Project Structure

```
blog-app/
├── 📂 blog-list/                    # Backend (Node.js/Express)
│   ├── 📂 controllers/              # Route handlers
│   │   ├── blogs.js                 # Blog CRUD operations
│   │   ├── login.js                 # Authentication
│   │   ├── user.js                  # User management
│   │   └── testing.js               # Test utilities
│   ├── 📂 models/                   # MongoDB schemas
│   │   ├── blogs.js                 # Blog model
│   │   └── user.js                  # User model
│   ├── 📂 tests/                    # Backend tests
│   │   ├── blogs_api.test.js        # Blog API tests
│   │   ├── user_api.test.js         # User API tests
│   │   └── list_helper.test.js      # Helper function tests
│   ├── 📂 utils/                    # Utility functions
│   │   ├── config.js                # Environment configuration
│   │   ├── logger.js                # Logging utilities
│   │   ├── middleware.js            # Express middleware
│   │   └── list_helper.js           # Helper functions
│   ├── app.js                       # Express app configuration
│   ├── index.js                     # Server entry point
│   ├── Dockerfile                   # Backend container config
│   └── package.json                 # Backend dependencies
│
├── 📂 bloglist-frontend/            # Frontend (React/Vite)
│   ├── 📂 src/
│   │   ├── 📂 components/           # React components
│   │   │   ├── AddBlogForm.jsx      # Blog creation form
│   │   │   ├── Blog.jsx             # Blog post component
│   │   │   ├── LoginForm.jsx        # User login form
│   │   │   ├── Notification.jsx     # Alert notifications
│   │   │   └── Toggleable.jsx       # Collapsible component
│   │   ├── 📂 services/             # API services
│   │   │   └── blog.js              # Blog API client
│   │   ├── 📂 tests/                # Frontend tests
│   │   │   └── Blog.test.js         # Component tests
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # App entry point
│   ├── 📂 cypress/                  # E2E tests
│   │   └── e2e/
│   │       └── blog-app.cy.js       # Cypress tests
│   ├── Dockerfile                   # Main frontend container
│   ├── Dockerfile.standalone        # Standalone frontend container
│   ├── docker-compose.frontend.yaml # Standalone deployment config
│   ├── entrypoint.sh               # Runtime env injection script
│   ├── run-frontend.sh             # Standalone build & run script
│   ├── nginx.conf                   # Nginx SPA configuration
│   ├── vite.config.js               # Vite build config
│   └── package.json                 # Frontend dependencies
│
├── docker-compose.yaml              # Main 2-service orchestration
├── build.sh                        # Streamlined build script
├── .env.example                     # Environment template
├── DOCUMENTATION.md                 # Detailed documentation
└── README.md                        # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Mongoose with custom validators
- **Testing**: Jest + Supertest
- **Security**: bcrypt for password hashing

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Cypress
- **Styling**: CSS3 with responsive design

### DevOps & Deployment
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for frontend static files)
- **Runtime Configuration**: Environment variable injection at container startup
- **Process Management**: dumb-init for proper signal handling
- **Security**: Non-root users, security updates, health checks
- **CI/CD Ready**: Standalone images perfect for continuous deployment

## ⚙️ Environment Variables

### Backend (.env)
```bash
# Server Configuration
PROD_PORT=8081                # Backend API port
DEV_PORT=3001                 # Development port
TEST_PORT=3002               # Test environment port

# Database Configuration
MONGO_URL=mongodb+srv://...   # MongoDB Atlas connection string
TEST_MONGO_URL=mongodb+srv://... # Test database URL

# Security
SECRET_KEY=your-jwt-secret    # JWT signing secret (change in production)
```

### Frontend (Runtime Injection)
```bash
# API Configuration (injected at container startup)
VITE_API_URL=http://localhost:8081/api  # Backend API endpoint

# Port Configuration (for standalone deployment)
FRONTEND_PORT=3001           # Frontend port mapping
NODE_ENV=development         # Environment mode
```

### Key Features of Environment Configuration:
- **Runtime Injection**: Frontend API URL can be changed without rebuilding the image
- **Same Image, Multiple Environments**: Use one Docker image across dev/staging/production
- **Flexible Deployment**: Frontend can connect to any backend URL
- **Security**: Sensitive values not baked into images

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/mprabesh/blog-app.git
cd blog-app
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables (MongoDB URL, etc.)
nano .env
```

### 3. Choose Your Deployment

#### Option A: Full Stack (Docker Compose)
```bash
# Build and run both frontend and backend
./build.sh

# Or manually
docker-compose up -d
```

#### Option B: Standalone Frontend Only
```bash
cd bloglist-frontend

# Quick start with defaults
./run-frontend.sh

# Or with custom API URL
./run-frontend.sh --api-url=https://your-api.com --port=8080

# Or using Docker Compose
docker-compose -f docker-compose.frontend.yaml up -d
```

### 4. Access Application
- **Frontend**: http://localhost:3001 (or custom port)
- **Backend API**: http://localhost:8081
- **API Documentation**: http://localhost:8081/api

## 🐳 Deployment Options

### 1. Full Stack Deployment (Docker Compose)
Perfect for development and integrated environments:

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Standalone Frontend Deployment
Perfect for production where backend is hosted separately:

```bash
cd bloglist-frontend

# Using the convenience script
./run-frontend.sh --api-url=https://api.myapp.com --port=3001

# Using Docker directly
docker build -f Dockerfile.standalone -t blog-frontend:latest .
docker run -d -p 3001:80 \
  -e VITE_API_URL=https://api.myapp.com \
  blog-frontend:latest

# Using standalone Docker Compose
docker-compose -f docker-compose.frontend.yaml up -d
```

### 3. Kubernetes/Cloud Deployment
The standalone frontend image is perfect for cloud platforms:

```yaml
# kubernetes-frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-frontend
  template:
    metadata:
      labels:
        app: blog-frontend
    spec:
      containers:
      - name: frontend
        image: blog-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_URL
          value: "https://api.myapp.com"
```

## 🧪 Testing

### Backend Tests
```bash
cd blog-list
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

### Frontend Tests
```bash
cd bloglist-frontend
npm test                 # Unit tests
npm run cypress:open     # E2E tests
```

### Docker Health Checks
```bash
# Check container health
docker-compose ps
docker inspect blog-app-backend-1 | grep Health
```

## 🔧 Development

### Local Development Setup
```bash
# Backend
cd blog-list
npm install
npm run start:dev        # Runs on port 8081

# Frontend (in new terminal)
cd bloglist-frontend
npm install
npm run dev              # Runs on port 5173
```

### Environment Variables

#### Backend (.env)
```bash
PROD_PORT=8081                    # Production port
DEV_PORT=3001                     # Development port
MONGO_URL={DB_URL}                # URL for DATABASE
SECRET_KEY=your-secret-key        # JWT secret
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8081/api    # Backend API URL
```

## 📡 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/users` - User registration

### Blogs
- `GET /api/blogs` - Get all blogs
- `POST /api/blogs` - Create new blog (auth required)
- `PUT /api/blogs/:id` - Update blog (auth required)
- `DELETE /api/blogs/:id` - Delete blog (auth required)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### System
- `GET /api/ping` - Health check

## 🔒 Security Features

- **Authentication**: JWT-based session management
- **Password Security**: bcrypt hashing with salt rounds
- **CORS**: Configured for cross-origin requests
- **Container Security**: Non-root users in all containers
- **Input Validation**: Mongoose schema validation
- **Security Headers**: Nginx security headers
- **Environment Variables**: Sensitive data in environment files

## 📊 Monitoring & Health Checks

### Docker Health Checks
- **Backend**: `curl -f http://localhost:8081/api/ping`
- **Frontend**: `curl -f http://localhost:80`

### Logging
- **Backend**: Structured logging with custom logger
- **Frontend**: Browser console and network monitoring
- **Docker**: Container logs via `docker-compose logs`

## 🚀 Production Deployment

### Optimizations
- **Multi-stage Docker builds** for smaller images
- **Production builds** with minification
- **Security updates** in base images
- **Health checks** for service monitoring
- **Restart policies** for high availability

### Scaling
```bash
# Scale services
docker-compose up -d --scale backend=3
docker-compose up -d --scale frontend=2
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📝 Scripts Reference

### Root Directory
- `./build.sh` - Build and run with Docker Compose
- `./docker-run.sh` - Run with individual Docker containers

### Backend (blog-list/)
- `npm run start:dev` - Development server with nodemon
- `npm run start:prod` - Production server
- `npm test` - Run Jest tests
- `npm run lint` - ESLint code checking

### Frontend (bloglist-frontend/)
- `npm run dev` - Development server (Vite)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm test` - Run Jest tests
- `npm run cypress:open` - Open Cypress E2E tests

## 🐛 Troubleshooting

### Common Issues

#### Container Health Check Failures
```bash
# Check container logs
docker-compose logs frontend
docker-compose logs backend

# Manual health check
docker exec blog-app-backend-1 curl -f http://localhost:8081/api/ping
```

#### API Connection Issues
```bash
# Verify environment variables
docker exec blog-app-frontend-1 env | grep VITE
docker exec blog-app-backend-1 env | grep MONGO_URL
```

#### Database Connection Issues
```bash
# Check MongoDB Atlas connection
docker exec blog-app-backend-1 node -e "console.log(process.env.MONGO_URL)"
```

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Prabesh Magar**
- GitHub: [@mprabesh](https://github.com/mprabesh)

---

## 🏷️ Version History

- **v1.0.0** - Initial release with basic blog functionality
- **v1.1.0** - Added Docker containerization
- **v1.2.0** - Removed nginx proxy, simplified architecture
- **v1.3.0** - Added health checks and production optimizations

---

**Built with ❤️ using React, Node.js, and Docker**
