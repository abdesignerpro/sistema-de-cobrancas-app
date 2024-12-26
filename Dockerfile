# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build with reduced size
RUN npm run build && \
    rm -rf node_modules

# Production stage with minimal nginx
FROM nginx:alpine-slim

# Remove default nginx config and unnecessary files
RUN rm -rf /etc/nginx/conf.d/* && \
    rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Make sure nginx can access the files
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    # Remove unnecessary files
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
