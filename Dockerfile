FROM node:22-slim
WORKDIR /app
COPY src ./src
COPY server.mjs ./
COPY package.json ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.mjs"]
