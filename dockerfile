FROM node:argon

ENV app_dir /usr/src/app

# Create app directory
RUN mkdir -p /usr/src/app

#COPY consul /usr/local/bin
#RUN chmod 777 /usr/local/bin/consul
#COPY consul.d /etc/consul.d
#RUN /usr/local/bin/consul agent -data-dir /tmp/consul -config-dir /etc/consul.d

WORKDIR /usr/src/app

#COPY package.json /usr/src/app/
#RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000

#CMD [ "consul", "agent", "-data-dir", "/tmp/consul", "-config-dir", "/etc/consul.d" ]
CMD npm start

