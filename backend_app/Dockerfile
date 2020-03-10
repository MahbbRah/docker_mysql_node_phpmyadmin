FROM mhart/alpine-node:12

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g nodemon

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

EXPOSE 8080
EXPOSE 443
# THE LIFE SAVER
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && npm start
