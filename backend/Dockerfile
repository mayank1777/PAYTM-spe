# Use Node.js LTS base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the backend port (3000)
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"]
