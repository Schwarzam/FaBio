FROM node:20
 
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]

# HACK: [For production]
# FROM node:20
 
# WORKDIR /frontend
# RUN rm -rf ./*
# COPY . .
# RUN npm i
# RUN npm run build

