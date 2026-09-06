# Use the official Node.js image as a base
FROM node:26.8.1

# Upgrade npm to latest version
RUN npm install -g npm@latest

# Set the working directory in the container
WORKDIR /app

# Install build tools and setuptools (required for node-gyp on Python 3.12+ for native addons like sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-setuptools \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and compile native sqlite3 bindings
RUN npm install && \
    cd node_modules/sqlite3 && \
    npx --no-install node-gyp rebuild && \
    node -e "require('sqlite3')"

# Copy the rest of the application code
COPY src/ ./src

# Expose the port that the app will run on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]