# Use Node.js 18 LTS (required for modern Expo)
FROM node:18-alpine

# Set working directory
WORKDIR /opt/react_native_app

# Install global dependencies
RUN npm install -g @expo/cli@latest

# Create app directory and set permissions
RUN mkdir -p /opt/react_native_app && chown -R node:node /opt/react_native_app

# Switch to node user for security
USER node

# Copy package files first for better caching
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY --chown=node:node . .

# Expose ports for Expo development
EXPOSE 8081 19000 19001 19002 19006

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start Expo development server
CMD ["npx", "expo", "start", "--dev-client", "--clear"]
