FROM node:8.9-stretch

# Set the application directory
WORKDIR /app

# Install requirements from package.json
ADD package.json /app/package.json
RUN apt-get update && apt-get install -y build-essential
RUN yarn install

# Copy source files from the current folder to /app inside the container
ADD . /app