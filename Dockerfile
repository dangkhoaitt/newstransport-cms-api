
FROM node:12-alpine

WORKDIR /home/ubuntu/newtransport-cms-api

COPY package*.json ./

COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 7005

CMD [ "yarn", "start" ]

