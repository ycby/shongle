FROM node:lts-alpine
WORKDIR /app
COPY ./dist .
COPY ./package.json .
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "--env-file=.env", "src/index.ts"]
