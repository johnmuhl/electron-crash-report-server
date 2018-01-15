FROM node:8.9-alpine

# Set the application directory
WORKDIR /app

# Install requirements from package.json
ADD package.json /app/package.json
RUN yarn install

# Copy source files from the current folder to /app inside the container
ADD . /app