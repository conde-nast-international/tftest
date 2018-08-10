FROM node:8.11.3-alpine

USER root
WORKDIR /home/node/

COPY bin/ /home/node/bin/
COPY lib/ /home/node/lib/
COPY scripts/ /home/node/scripts/
COPY spec/ /home/node/spec/
COPY .istanbul.yml /home/node/.istanbul.yml
COPY jasmine.json /home/node/jasmine.json
COPY package-lock.json /home/node/package-lock.json
COPY package.json /home/node/package.json

RUN npm install --loglevel warn
RUN npm run download-dependencies

USER node
CMD ["npm", "run" ,"test"]
