# Stage 1: Build the React App
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the built Vite files
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy our custom routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]