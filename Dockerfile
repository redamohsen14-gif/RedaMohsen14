# Al-Shalawi Gold Factory Backend
# Node.js Backend Dockerfile

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Sharp (image processing)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directories
RUN mkdir -p uploads/products uploads/thumbnails uploads/temp logs && \
    chmod -R 755 uploads logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
