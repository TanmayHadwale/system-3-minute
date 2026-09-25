FROM node:22-bookworm-slim

WORKDIR /app

COPY server/package*.json ./server/

WORKDIR /app/server

RUN npm install --build-from-source=sqlite3

COPY server/ .

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
