# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install cross-env globally
RUN npm install -g cross-env

# Install typescript globally
# RUN npm install -g typescript
RUN npm install -g @medusajs/medusa-cli
# RUN npm install -g @medusajs/admin

# Copy the rest of the application code
COPY . .

# Expose the ports the app runs on
EXPOSE 7001 9000
