# Step 1: Build the app
FROM node:18 

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port 5500
EXPOSE 5173

# Command to run app
CMD ["npm","run","dev"]
