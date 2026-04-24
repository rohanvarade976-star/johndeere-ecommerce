# Use a Debian-based Node image to support MySQL installation
FROM node:18-bullseye

# Install MySQL Server and netcat
RUN apt-get update && \
    apt-get install -y mysql-server netcat && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install

COPY backend/ .

# Copy the database initialization script
COPY database/deploy_db.sql /docker-entrypoint-initdb.d/init.sql

# Create a startup script that initializes MySQL and then starts the Node app
RUN echo '#!/bin/bash\n\
service mysql start\n\
# Wait for MySQL to be ready\n\
until mysqladmin ping >/dev/null 2>&1; do echo "Waiting for MySQL..."; sleep 2; done\n\
# Initialize database if not already done\n\
mysql < /docker-entrypoint-initdb.d/init.sql\n\
# Set root password to root\n\
mysql -e "ALTER USER \"root\"@\"localhost\" IDENTIFIED WITH mysql_native_password BY \"root\"; FLUSH PRIVILEGES;"\n\
# Start the Node app\n\
npm start' > /usr/local/bin/start.sh && chmod +x /usr/local/bin/start.sh

EXPOSE 5000

CMD ["/usr/local/bin/start.sh"]
