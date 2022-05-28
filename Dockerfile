FROM node:16-alpine
WORKDIR /usr/app
COPY ./ /usr/app
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm install
RUN npm install pm2 -g
RUN npm run build
EXPOSE 2567
CMD pm2-runtime start ./lib/index.js -i -1