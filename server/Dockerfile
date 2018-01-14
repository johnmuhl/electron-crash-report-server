FROM node:8.9

# Set the application directory
WORKDIR /app

# Install our requirements.txt
ADD package.json /app/package.json
RUN yarn install

# Copy our code from the current folder to /app inside the container
ADD . /app