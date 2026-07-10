# Abu Kartona Deployment Guide

This guide will help you deploy the Abu Kartona e-commerce application to various platforms.

## 🚀 Quick Deploy Options

### 1. Netlify (Frontend Only)
1. **Frontend Deployment:**
   ```bash
   cd frontend
   npm run build
   ```
   - Push to GitHub
   - Connect your repo to Netlify
   - Set environment variables in Netlify dashboard

2. **Backend Deployment** (Separate):
   - Deploy to Render, Heroku, or Railway
   - Update `NEXT_PUBLIC_API_BASE_URL` in Netlify

### 2. Vercel (Full Stack)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard

### 3. Docker (Self-Hosted)
1. Build and run:
   ```bash
   docker-compose up -d
   ```

2. Access at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

## 📋 Environment Variables Setup

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Backend (.env.production)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/abukartona
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-domain.com
```

## 🔧 Platform-Specific Instructions

### Netlify
1. **Frontend:**
   - Connect GitHub repo to Netlify
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/.next`

2. **Backend on Render:**
   - Create new Web Service
   - Connect repo
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`

### Vercel
- Full-stack deployment supported
- Automatic environment variable management
- Built-in CI/CD

### Railway
- Both frontend and backend can be deployed
- Automatic MongoDB provisioning
- Easy environment variable management

### DigitalOcean App Platform
- Supports both frontend and backend
- Managed MongoDB available
- Custom domains supported

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Set `MONGODB_URI` environment variable

### Self-hosted MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Set strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Backup database regularly

## 🌍 Domain Configuration

### Custom Domain
1. Point DNS to your deployment platform
2. Update `NEXT_PUBLIC_SITE_URL`
3. Configure SSL certificates
4. Update CORS settings

## 📊 Monitoring & Logging

### Recommended Tools
- **Frontend:** Vercel Analytics, Google Analytics
- **Backend:** Winston, Morgan logs
- **Database:** MongoDB Atlas monitoring
- **Uptime:** UptimeRobot, Pingdom

## 🚦 Deployment Commands

### Production Build
```bash
# Frontend
cd frontend && npm run build

# Backend (no build needed, just install)
cd backend && npm ci --only=production
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Run in production
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

### Git-based Deployment
```bash
# Commit and push changes
git add .
git commit -m "Deployment ready"
git push origin main

# Platform will auto-deploy
```

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts:** Change ports in docker-compose.yml
2. **Environment variables:** Double-check all required variables
3. **Database connection:** Verify MongoDB URI and network access
4. **CORS errors:** Ensure frontend URL is whitelisted
5. **Build failures:** Check Node.js version compatibility

### Debug Mode
```bash
# Frontend debug
cd frontend && npm run dev

# Backend debug
cd backend && npm run dev
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review logs in deployment dashboard
3. Verify environment variables
4. Test database connection
5. Check network configurations

---

**🎉 Your Abu Kartona application is now ready for production deployment!**
