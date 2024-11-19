FROM node:22-alpine

#set working directory inside container
WORKDIR /app

#copy package files to conainer
COPY package*.json ./

# install dependencies
RUN npm install

# Copy app to conainer
COPY . .

#expose port for app
EXPOSE 3001

#Start the app
CMD ["node", "app.js"]
