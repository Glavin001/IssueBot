#!/usr/bin/env bash
set -e

# Start PostgreSQL
echo "Start PostgreSQL"
/etc/init.d/postgresql start

# Start program
echo "Start IssueBot"
NODE_ENV=resin npm run start:server
# sleep 365d
