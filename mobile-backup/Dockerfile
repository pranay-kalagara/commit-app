# React Native Mobile App Dockerfile
# Use Node 18 Alpine as base image
FROM node:18-alpine

# Set environment variables
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

# Install system dependencies
RUN apk add --no-cache git

# Install global packages as root
RUN npm install -g @expo/cli@latest

# Create app directory with proper permissions
RUN mkdir -p /opt/react_native_app && chown node:node /opt/react_native_app
WORKDIR /opt/react_native_app

# Switch to node user
USER node

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm install

# Copy source code
COPY --chown=node:node . .

# Expose ports for Expo
EXPOSE 19006 19001 19002 8081

# Default command - use npm script for web
CMD ["npm", "run", "web"]
