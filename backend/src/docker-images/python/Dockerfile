FROM python:3.11-alpine

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S executor && \
    adduser -u 1001 -S executor -G executor

# Set working directory
WORKDIR /app

# Copy executor script
COPY executor.py /app/
RUN chmod +x /app/executor.py

# Create temp directory
RUN mkdir -p /app/temp && chown executor:executor /app/temp

# Switch to non-root user
USER executor

# Use dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Default command
CMD ["python3", "/app/executor.py"]
