# Use a Debian-based Node image
FROM node:18-bullseye

# Install MariaDB Server (MySQL compatible) and netcat
RUN apt-get update && \
    apt-get install -y mariadb-server netcat && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install

COPY backend/ .

# Copy the database initialization script
COPY database/deploy_db.sql /docker-entrypoint-initdb.d/init.sql

# Create a startup script
RUN echo '#!/bin/bash\n\
service mariadb start\n\
# Wait for MariaDB to be ready\n\
until mariadb-admin ping >/dev/null 2>&1; do echo "Waiting for MariaDB..."; sleep 2; done\n\
# Initialize database\n\
mariadb < /docker-entrypoint-initdb.d/init.sql\n\
# Ensure root can connect with password from anywhere\n\
mariadb -e "SET PASSWORD FOR \"root\"@\"localhost\" = PASSWORD(\"root\");"\n\
mariadb -e "GRANT ALL PRIVILEGES ON *.* TO \"root\"@\"%\" IDENTIFIED BY \"root\" WITH GRANT OPTION;"\n\
mariadb -e "FLUSH PRIVILEGES;"\n\
# Start the Node app\n\
npm start' > /usr/local/bin/start.sh && chmod +x /usr/local/bin/start.sh

EXPOSE 5000

CMD ["/usr/local/bin/start.sh"]
