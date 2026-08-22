FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate the Prisma client against the schema baked into the image
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/server.js"]
