# Use Node.js environment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the default React port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]