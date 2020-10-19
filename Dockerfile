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
EXPOSE 8080 8881 8882
CMD [ "node", "server.js" ]
