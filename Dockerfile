FROM node:17-alpine as build-image
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN npm ci
RUN npx tsc

FROM node:17-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=build-image /app ./dist
RUN npm ci --production
COPY . .
EXPOSE 8080
CMD [ "node", "dist/server.js" ]