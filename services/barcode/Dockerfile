FROM mhart/alpine-node:base-7
WORKDIR /src
ADD . .
EXPOSE 80

CMD ["node_modules/.bin/forever", "server.js"]
