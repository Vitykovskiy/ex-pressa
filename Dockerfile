FROM node:20-alpine
RUN apt update && apt install -y nodejs && apt install -y npm
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
