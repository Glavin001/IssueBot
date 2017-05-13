#!/usr/bin/env sh
set -e

# Start PostgreSQL
echo "Start PostgreSQL"
/etc/init.d/postgresql start

# Create database
echo "Create PostgreSQL database"
echo "createdb issuemanager" | sudo -i -u postgres

# Create User role
echo "Create PostgreSQL User"
echo "psql issuemanager --command=\"create user resin password 'resin';\"" | sudo -i -u postgres

# Stop PostgreSQL
echo "Stop PostgreSQL"
/etc/init.d/postgresql stop
