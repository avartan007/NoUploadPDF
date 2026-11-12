FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY src ./src
COPY scripts ./scripts
COPY public ./public
COPY index.html ./index.html
RUN node scripts/sync-static.mjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server/index.js"]
