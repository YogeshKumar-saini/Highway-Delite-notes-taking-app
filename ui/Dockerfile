# Frontend Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build frontend
RUN npm run build

# Production server (Next.js) or Nginx (React)
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=build /app ./

EXPOSE 3000
# environment variables
ENV ENV_PATH=ui/.env
ENV NODE_ENV=production

CMD ["npm", "start"]
