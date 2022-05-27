FROM node:16-alpine
WORKDIR /app
COPY . .
EXPOSE 2567
RUN npm install pm2 -g
RUN npm install
RUN npm run build
CMD pm2-runtime start ./lib/index.js -i -1