FROM gitpod/workspace-base:latest
USER root

# Install PostgreSQL
ENV PGVERSION=15
RUN apt-get update \
    && apt-get install -y postgresql postgresql-client postgresql-server-dev-${PGVERSION} libpq-dev

ARG BUILD=ci
ARG DEV=true
ARG CI_CLIENT_ID=marep_dev
ARG CI_ORION_URI=
ARG CI_ENVIRONMENT_URL

# Setup the database user env vars, drop the default database cluster and change the folders to the workspace
# This makes it possible to persist the database within the workspace
ENV DATABASE_USERNAME=postgres
ENV DATABASE_PASSWORD=postgres
RUN pg_dropcluster $PGVERSION main \
    && rm -rf /etc/postgresql /var/lib/postgresql \
    && ln -s /workspace/etc/postgresql /etc/postgresql \
    && ln -s /workspace/var/lib/postgresql /var/lib/postgresql \
    && chown -h postgres:postgres /etc/postgresql /var/lib/postgresql

#### User space ####
USER gitpod

# Install nvm and Node
ENV NODE_VERSION=16.13.0
RUN curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | PROFILE=/dev/null bash \
    && bash -c ". .nvm/nvm.sh \
    && nvm install v${NODE_VERSION} \
    && nvm alias default v${NODE_VERSION} \
    && npm install -g npm yarn node-gyp" \
    && echo ". ~/.nvm/nvm.sh"  >> ~/.bashrc.d/50-node

# build serverside & client side
WORKDIR /opt/machinasapiens
COPY package.json .
RUN yarn
COPY . .
RUN yarn client:setup
RUN yarn client:build



