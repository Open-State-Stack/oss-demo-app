# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire app to the container
COPY . .

# Set the environment to production
ENV NODE_ENV=production

# Set environment variables for the application
ENV NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:4000

# Build the React app
RUN npm run build

# Expose the port the app will run on (usually 3000 for React)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
