#!/usr/bin/env python
"""Install dependencies for the Movie Recommendation Engine"""
import subprocess
import sys

packages = ['pandas', 'numpy', 'scikit-learn', 'Flask', 'flask-cors']

print("Installing required packages...")
print("=" * 50)

for package in packages:
    print(f"\nInstalling {package}...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package], 
                            stdout=sys.stdout, stderr=sys.stderr)
        print(f"✅ {package} installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        sys.exit(1)

print("\n" + "=" * 50)
print("All packages installed successfully!")
print("\nVerifying installation...")

try:
    import pandas
    import numpy
    import sklearn
    import flask
    import flask_cors
    print("✅ All packages verified and ready to use!")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

