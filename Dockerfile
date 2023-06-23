FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --loglevel verbose

COPY . .

EXPOSE 3000

CMD ["npm", "start"]