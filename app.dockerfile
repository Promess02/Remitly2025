# Use the official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild native modules for the container's environment
RUN npm rebuild sqlite3 --build-from-source

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your application runs on
EXPOSE 8080

# Set the command to run your application
CMD ["node", "server.js"]