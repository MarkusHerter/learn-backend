FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm config set fetch-retry-maxtimeout 1000000

RUN npm install --loglevel verbose --no-audit

COPY . .

EXPOSE 3000

CMD ["npm", "start"]