# 📝 Blog Application

A full-stack blog application built with React frontend and Node.js backend, containerized with Docker for easy deployment.

## 🏗️ Architecture

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

## 🚀 Features

- **User Authentication**: Register, login, and JWT-based session management
- **Blog Management**: Create, read, update, and delete blog posts
- **Responsive UI**: Modern React interface with responsive design
- **RESTful API**: Clean API architecture with proper HTTP methods
- **Containerized**: Docker containers for easy deployment
- **Testing**: Unit tests for both frontend and backend
- **Production Ready**: Optimized builds with security best practices

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
│   ├── Dockerfile                   # Frontend container config
│   ├── nginx.conf                   # Nginx configuration
│   ├── vite.config.js               # Vite build config
│   └── package.json                 # Frontend dependencies
│
├── docker-compose.yaml              # Multi-container orchestration
├── build.sh                        # Automated build script
├── docker-run.sh                   # Docker run script
├── .env.example                     # Environment template
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
- **Process Management**: dumb-init for proper signal handling
- **Security**: Non-root users, security updates, health checks

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

### 3. Docker Compose (Recommended)
```bash
# Build and run with Docker Compose
./build.sh

# Or manually
docker-compose up -d
```

### 4. Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8081
- **API Documentation**: http://localhost:8081/api

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker Run
```bash
# Run with individual containers
./docker-run.sh

# Or manually
docker network create blog-app-network
docker run -d --name blog-app-backend --network blog-app-network \
  -p 8081:8081 --env-file .env backend:v1
docker run -d --name blog-app-frontend --network blog-app-network \
  -p 3001:80 --env-file .env frontend:v1
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
