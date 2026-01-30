FROM node:20-alpine

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci

# build app
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
