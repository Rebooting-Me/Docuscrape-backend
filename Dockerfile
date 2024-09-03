FROM mcr.microsoft.com/playwright:v1.45.1-jammy

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the application with the pre-existing non-root user
USER pwuser
CMD ["node", "server.js"]