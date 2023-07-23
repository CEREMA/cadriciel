FROM gitpod/workspace-full

USER gitpod

ARG BUILD=ci
ARG DEV
ARG CI_CLIENT_ID
ARG CI_ORION_URI
ARG CI_ENVIRONMENT_URL

# build serverside & client side
WORKDIR /opt/machinasapiens
RUN rm -rf /var/lib/apt/lists/* && rm -rf /etc/apt/sources.list.d/* && apt update && \
    apt install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y gcc g++ make nodejs && \
    npm install -g yarn
COPY package.json .
RUN yarn
COPY . .
RUN yarn client:setup
RUN yarn client:build



