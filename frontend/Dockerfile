# Stage 1: Build the React app
FROM node:16 as build

# Set the working directory
WORKDIR /app


# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files (including .env if necessary)
COPY . .

# Set the environment variable for build time
# This will allow React to use the correct backend URL during the build

# Build the app (using the .env file copied earlier)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy build output to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port (80 for Nginx)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
