# FROM node:20
 
# WORKDIR /frontend
# COPY . .
# RUN npm i
# EXPOSE 3000
# CMD [ "npm", "start" ]

# HACK: [For production]
FROM node:20
 
WORKDIR /frontend

COPY . .
RUN npm i
RUN npm run build

