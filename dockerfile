FROM node:10-stretch-slim
WORKDIR /app
COPY . /app
RUN apt-get update && apt-get install -y build-essential && yarn install
EXPOSE 80
CMD ["node", "index.js"]
