@echo off
echo Starting all services...

echo Starting dareal-axios apiclient on port 8000...
start "dareal-axios apiclient" cmd /c "python -m http.server --directory dareal-axios\api-client 8000"

echo Starting dareal-ccNetViz ccnetviz-website on port 8080...
start "dareal-ccNetViz ccnetviz-website" cmd /c "python -m http.server --directory dareal-ccNetViz\ccnetviz-website 8080"

echo Starting dareal-express todo-app on port 9090...
start "dareal-express todo-app" cmd /c "cd dareal-express\todo-app && node server.js"

echo.
echo =====================================
echo All services started in separate windows!
echo =====================================
echo - dareal-axios apiclient           : http://localhost:8000
echo - dareal-ccNetViz ccnetviz-website : http://localhost:8080
echo - dareal-express todo-app          : http://localhost:9090
echo =====================================
echo Close the individual command prompt windows to stop the services.
pause
