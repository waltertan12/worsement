FROM node:10-slim
WORKDIR /var/www/html
COPY package.json ./
COPY yarn.lock ./
RUN yarn ci
COPY src ./
RUN yarn build

ENTRYPOINT ["yarn", "start"]
