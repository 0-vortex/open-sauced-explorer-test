FROM node:16-alpine as development

WORKDIR /app

COPY package.json ./
COPY npm-shrinkwrap.json ./

RUN npm ci

COPY public ./public
COPY src ./src

CMD [ "npm", "start"]

FROM development as builder

RUN npm run build

FROM nginx:1.21-alpine as production

COPY --from=builder /app/build /usr/share/nginx/html
