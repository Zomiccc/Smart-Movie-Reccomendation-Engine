# Smart Movie Recommendation Engine – Offline Netflix-Style

A full-stack offline movie recommendation system. Users select favorite movies, and the system recommends similar titles using TF-IDF + cosine similarity. Interactive Netflix-style frontend with cards showing title, genres, and similarity scores.

## Features

- 🎬 **Offline, local dataset only** - No API calls, runs completely locally
- 🧠 **Content-based recommendations** - Uses TF-IDF vectorization and cosine similarity
- 🎨 **Interactive Netflix-style frontend** - Beautiful, modern UI with smooth animations
- 🔍 **Smart search** - Real-time movie search with genre filtering
- 📊 **Similarity scores** - Visual representation of recommendation match quality
- ⚡ **Full-stack architecture** - Python + Flask backend + HTML/CSS/JS frontend

## Tech Stack

- **Backend**: Python + Flask
- **ML Libraries**: pandas, numpy, scikit-learn
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Dataset**: MovieLens-style CSV (offline)

## How to Run

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation Steps

1. **Clone or navigate to the repository**
   ```bash
   cd "Smart Movie Reccomendation Engine"
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the backend server**
   ```bash
   python app.py
   ```
   
   The server will start on `http://localhost:5000`

4. **Open the frontend**
   - Open `index.html` in your web browser
   - Or navigate to `http://localhost:5000` in your browser

5. **Get recommendations**
   - Search and select 3-5 favorite movies
   - Click "Get Recommendations"
   - View your personalized movie suggestions!

## Project Structure

```
Smart Movie Reccomendation Engine/
├── app.py              # Flask backend with recommendation logic
├── index.html          # Main frontend page
├── style.css           # Netflix-style styling
├── script.js           # Frontend JavaScript logic
├── movies.csv          # Movie dataset (genres, keywords, ratings)
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## How It Works

### Backend Workflow

1. **Data Loading**: Loads movies from `movies.csv`
2. **Preprocessing**: Combines genres and keywords into a single text field
3. **TF-IDF Vectorization**: Converts text features into numerical vectors
4. **Similarity Calculation**: 
   - Creates a user profile by averaging favorite movie vectors
   - Computes cosine similarity with all movies
   - Returns top 5 most similar movies

### Frontend Workflow

1. **Movie Selection**: User searches and selects favorite movies
2. **API Request**: Sends selected movies to `/api/recommend` endpoint
3. **Display**: Shows recommendations in Netflix-style cards with:
   - Movie title and rating
   - Genre tags
   - Keywords
   - Similarity score with visual bar

## API Endpoints

### `GET /api/movies`
Returns list of all available movies.

**Response:**
```json
[
  {
    "title": "The Shawshank Redemption",
    "genres": "Drama|Crime",
    "rating": 9.3
  },
  ...
]
```

### `POST /api/recommend`
Get movie recommendations based on user favorites.

**Request Body:**
```json
{
  "favorites": ["The Shawshank Redemption", "The Godfather", "Inception"]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "title": "The Green Mile",
      "genres": "Drama|Fantasy",
      "keywords": "prison death row supernatural miracle",
      "rating": 8.6,
      "similarity_score": 0.85
    },
    ...
  ],
  "count": 5
}
```

## Dataset Format

The `movies.csv` file should contain the following columns:
- `movieId`: Unique identifier
- `title`: Movie title
- `genres`: Pipe-separated genres (e.g., "Drama|Crime|Thriller")
- `keywords`: Space-separated keywords
- `rating`: Movie rating (optional)

## Customization

### Adding More Movies

Simply add rows to `movies.csv` following the existing format:
```csv
movieId,title,genres,keywords,rating
51,Your Movie Title,Genre1|Genre2,keyword1 keyword2 keyword3,8.5
```

### Adjusting Recommendation Count

In `app.py`, modify the `top_n` parameter in the `get_recommendations()` function call:
```python
recommendations = get_recommendations(favorite_movies, top_n=10)  # Change 5 to desired number
```

### Styling

Modify `style.css` to customize colors, fonts, and layout. The current theme uses Netflix-inspired red (#e50914) and dark backgrounds.

## Troubleshooting

### Backend won't start
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check that Python 3.7+ is being used
- Verify `movies.csv` exists in the same directory as `app.py`

### No recommendations returned
- Make sure you've selected at least one movie
- Check that movie titles match exactly (case-insensitive)
- Verify the backend server is running on port 5000

### CORS errors in browser
- The app uses `flask-cors` to handle cross-origin requests
- If issues persist, ensure you're accessing via `http://localhost:5000` or update CORS settings in `app.py`

## Future Enhancements

- [ ] Include movie posters/images
- [ ] Sort recommendations by rating
- [ ] Add user rating system
- [ ] Implement collaborative filtering
- [ ] Add movie details modal
- [ ] Export recommendations to CSV
- [ ] Dark/light theme toggle

## License

This project is open source and available for educational purposes.

## Credits

Built with ❤️ using Flask, scikit-learn, and vanilla JavaScript.

---

**Note**: This is an offline MVP designed for local use. No external APIs or cloud services are required.


<img width="1407" height="856" alt="image" src="https://github.com/user-attachments/assets/17b451b2-c5c5-422b-818f-6ad74d939a14" />
<img width="1912" height="933" alt="image" src="https://github.com/user-attachments/assets/98bb6b4c-47bf-420b-8f87-338d010f36e9" />



