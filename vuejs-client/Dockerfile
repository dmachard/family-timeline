# Build stage
FROM node:20.16.0 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vue.js application
RUN npm run build

# Production stage
FROM nginx:1.24.0-alpine

# Copy built files from the build stage to Nginx's directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]