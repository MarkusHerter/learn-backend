FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN sudo npm install --loglevel verbose --no-audit

COPY . .

EXPOSE 3000

CMD ["npm", "start"]