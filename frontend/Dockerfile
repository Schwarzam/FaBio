# FROM node:20
 
# WORKDIR /frontend
# COPY . .
# RUN npm i
# EXPOSE 3000
# CMD [ "npm", "start" ]

# HACK: [For production]
FROM node:lts-alpine3.19
 

WORKDIR /frontend
RUN rm -rf ./*

COPY . .
RUN npm i
RUN npm run build

