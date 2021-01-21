FROM node:14-slim
WORKDIR /var/www/html
COPY package.json ./
COPY yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .
RUN yarn build

ENTRYPOINT ["yarn", "start"]
