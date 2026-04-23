FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]
