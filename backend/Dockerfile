FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate the Prisma client against the schema baked into the image
RUN npx prisma generate

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "src/server.js"]
