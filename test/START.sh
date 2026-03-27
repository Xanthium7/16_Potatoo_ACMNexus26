#!/bin/bash

# Ensure we are in the root test directory
cd "$(dirname "$0")"

# Kill child processes when the script exits (e.g., via Ctrl+C)
trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "Starting dareal-axios apiclient on port 8000..."
python3 -m http.server --directory dareal-axios/api-client 8000 &

echo "Starting dareal-ccNetViz ccnetviz-website on port 8080..."
python3 -m http.server --directory dareal-ccNetViz/ccnetviz-website 8080 &

echo "Starting dareal-express todo-app on port 9090..."
(cd dareal-express/todo-app && node server.js) &

echo ""
echo "====================================="
echo "All services started successfully!"
echo "====================================="
echo "- dareal-axios apiclient           : http://localhost:8000"
echo "- dareal-ccNetViz ccnetviz-website  : http://localhost:8080"
echo "- dareal-express todo-app           : http://localhost:9090"
echo "====================================="
echo "Press Ctrl+C to stop all services."

# Wait for processes to exit
wait
