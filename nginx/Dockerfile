# Use the official Nginx image from Docker Hub
FROM nginx:latest

# Set the working directory
WORKDIR /etc/nginx

# Install OpenSSL to generate a self-signed certificate
RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Generate SSL certificate and key
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/cert.key \
    -out /etc/nginx/cert.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=OrganizationUnit/CN=example.com"

# Remove default configuration and add our own
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx-setup.conf /etc/nginx/conf.d/

# Expose ports for HTTP and HTTPS
EXPOSE 80 443