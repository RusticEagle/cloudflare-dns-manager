# See https://aka.ms/vscode-remote/devcontainer/base for more information
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bullseye

# [Optional] Uncomment if you want to add more OS packages
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# Install Docker CLI if needed by workflows
#RUN apt-get update && apt-get install -y docker.io && rm -rf /var/lib/apt/lists/*

# Create non-root user with fixed UID/GID for more stable behavior (optional - match host UID/GID if necessary)
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000
RUN groupadd --gid ${USER_GID} ${USERNAME} || true \
  && useradd -s /bin/bash --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME} || true

USER ${USERNAME}

WORKDIR /workspace/cloudflare-dns-manager
