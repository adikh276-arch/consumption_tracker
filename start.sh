#!/bin/sh

# Start backend server
npx tsx server/index.js &

# Start Nginx
nginx -g "daemon off;"
