FROM node:9
COPY package.json /tmp/package.json
RUN cd /tmp && npm install --only=production
WORKDIR /src
RUN cp -a /tmp/node_modules /src

COPY . .
EXPOSE 80
CMD ["node", "server.js"]
