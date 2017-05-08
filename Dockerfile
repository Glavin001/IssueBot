FROM resin/raspberry-pi-python:latest
MAINTAINER Glavin Wiechert <glavin.wiechert@gmail.com>

RUN apt-get update

# Install Node.js
ENV NODE_VERSION 7.8.0
RUN curl -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-armv6l.tar.gz" \
	&& echo "17244fea0ab0e94fbdae10b5998951c1d83fdab9d5b91209debdedc94a4fc7a1  node-v7.8.0-linux-armv6l.tar.gz" | sha256sum -c - \
	&& tar -xzf "node-v$NODE_VERSION-linux-armv6l.tar.gz" -C /usr/local --strip-components=1 \
	&& rm "node-v$NODE_VERSION-linux-armv6l.tar.gz" \
	&& npm config set unsafe-perm true -g --unsafe-perm \
	&& rm -rf /tmp/*

# Install more dependencies
RUN apt-get install -y \
    python-numpy python-scipy

# Install PostgreSQL
RUN apt-get install -y postgresql

# Defines our working directory in container
WORKDIR /usr/src/app

# Copy the application project
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY package.json .
RUN npm install

# Create PostgreSQL database
COPY scripts/create-database.sh scripts/create-database.sh
RUN chmod +x scripts/create-database.sh
RUN scripts/create-database.sh

# Build
COPY webpack.config.babel.js \
	.babelrc \
	./
COPY scripts/ scripts/
RUN chmod +x scripts/start.sh
COPY config/ config/
COPY src/ src/
COPY public/src/ public/src/
RUN npm run build

# Enable systemd init system in container
# ENV INITSYSTEM on

# Run on device
CMD scripts/start.sh