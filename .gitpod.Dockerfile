FROM gitpod/workspace-full

USER gitpod

# Install custom tools, runtimes, etc.
# For example "bastet", a command-line tetris clone:
# RUN brew install bastet
#
# More information: https://www.gitpod.io/docs/config-docker/

RUN brew install postgresql
RUN echo "export PATH=/home/linuxbrew/.linuxbrew/opt/postgresql/bin:$PATH" >> /home/gitpod/.bashrc
RUN echo "export PGDATA=/home/linuxbrew/.linuxbrew/var/postgres" >> /home/gitpod/.bashrc
RUN initdb /home/linuxbrew/.linuxbrew/var/postgres