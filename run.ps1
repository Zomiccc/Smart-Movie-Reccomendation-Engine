Write-Host "Starting Smart Movie Recommendation Engine..." -ForegroundColor Green
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host ""
Write-Host "Starting Flask server..." -ForegroundColor Yellow
Write-Host "Open http://localhost:5000 in your browser once the server starts" -ForegroundColor Cyan
Write-Host ""
python app.py

