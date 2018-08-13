FROM node:8.11.3-alpine

USER root
WORKDIR /home/node/

COPY . /home/node

RUN npm install --loglevel warn
RUN npm run download-dependencies

USER node
CMD ["npm", "run" ,"test"]
