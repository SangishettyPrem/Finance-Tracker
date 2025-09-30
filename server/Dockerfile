FROM node:20-alpine
WORKDIR /usr/src/app
COPY  package.json package-lock.json ./
RUN npm install
COPY . .
ENV NODE_ENV=PRODUCTION
RUN npm run build
CMD ["npm", "start"]