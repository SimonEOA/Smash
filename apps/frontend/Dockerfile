FROM node:21-alpine AS base

RUN mkdir -p /usr/app
WORKDIR /usr/app 
  
COPY app .
RUN npm install

RUN npm run build 
CMD ["npm", "run", "start"]