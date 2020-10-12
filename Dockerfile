# Specify where to get the base image and create a new container
FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Run the app
EXPOSE 8080 1883
CMD [ "node", "server.js" ]
