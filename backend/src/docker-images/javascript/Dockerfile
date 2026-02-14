FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S executor && \
    adduser -u 1001 -S executor -G executor

# Set working directory
WORKDIR /app

# Copy executor script
COPY executor.js /app/
RUN chmod +x /app/executor.js

# Create temp directory for user code
RUN mkdir -p /app/temp && chown executor:executor /app/temp

# Switch to non-root user
USER executor

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Default command
CMD ["node", "/app/executor.js"]
