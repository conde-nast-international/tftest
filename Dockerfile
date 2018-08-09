FROM node:8.11.3-alpine

USER root
WORKDIR /home/node/

COPY package.json /home/node/
COPY package-lock.json /home/node/
COPY lib/ /home/node/lib/
COPY bin/ /home/node/bin/

RUN npm install --production

USER node
CMD ["npm", "test"]
