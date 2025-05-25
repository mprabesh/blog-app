    # Use an official Node.js runtime as a parent imageFROM node:20-alpine AS builder
FROM node:20-alpine AS builder
    # Set the working directory in the container
WORKDIR /app

    # Copy package.json and package-lock.json (if available)
COPY package*.json ./
RUN npm ci --omit=dev


    # Install app dependencies
RUN npm install

    # Copy the rest of the app files
COPY . .

    # Build the app for production
RUN npm run build

    # Use a lightweight web server to serve the static files
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

    # Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

    # Expose port 80 for the app
EXPOSE 80

    # Start nginx
CMD ["nginx", "-g", "daemon off;"]