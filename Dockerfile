FROM ubuntu:jammy

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=America/Los_Angeles

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl wget gpg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get install -y --no-install-recommends git openssh-client && \
    npm install -g yarn && \
    rm -rf /var/lib/apt/lists/* && \
    adduser pwuser

# Set Playwright Browsers path
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install Playwright and its dependencies
RUN mkdir /ms-playwright && \
    mkdir /ms-playwright-agent && \
    cd /ms-playwright-agent && npm init -y && \
    npm install playwright && \
    npx playwright install --with-deps && \
    rm -rf /var/lib/apt/lists/* && \
    if [ "$(uname -m)" = "aarch64" ]; then \
    rm /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstwebrtc.so; \
    else \
    rm /usr/lib/x86_64-linux-gnu/gstreamer-1.0/libgstwebrtc.so; \
    fi && \
    rm -rf /ms-playwright-agent && \
    rm -rf ~/.npm/ && \
    chmod -R 777 /ms-playwright

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the application with non-root user
USER pwuser
CMD ["node", "server.js"]