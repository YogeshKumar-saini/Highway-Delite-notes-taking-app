# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript -> dist/
RUN npm run build

# Expose backend port
EXPOSE 5000
# environment variables
ENV ENV_PATH=functions/.env
ENV NODE_ENV=production

# Run compiled server
CMD ["node", "dist/server.js"]
