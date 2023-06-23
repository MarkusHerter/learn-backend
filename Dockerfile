FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN npm install --loglevel verbose --no-audit

COPY . .

EXPOSE 3000

CMD ["npm", "start"]