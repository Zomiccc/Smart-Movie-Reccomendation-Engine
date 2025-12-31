@echo off
echo Starting Smart Movie Recommendation Engine...
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Flask server...
python app.py
pause

