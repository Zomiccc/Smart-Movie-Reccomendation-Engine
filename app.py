from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
CORS(app)

# Global variables to store preprocessed data
df = None
tfidf_matrix = None
vectorizer = None
movie_titles = None

def load_and_preprocess_data():
    """Load CSV dataset and preprocess genres + keywords for TF-IDF"""
    global df, tfidf_matrix, vectorizer, movie_titles
    
    # Load dataset
    csv_path = os.path.join(os.path.dirname(__file__), 'movies.csv')
    df = pd.read_csv(csv_path)
    
    # Remove any rows with missing data
    df = df.dropna(subset=['title', 'genres', 'keywords'])
    
    # Combine genres and keywords into a single text field for TF-IDF
    df['combined_features'] = df['genres'].astype(str) + ' ' + df['keywords'].astype(str)
    
    # Store movie titles for easy lookup
    movie_titles = df['title'].tolist()
    
    # Initialize TF-IDF Vectorizer
    # Using ngram_range=(1, 2) to capture both single words and bigrams
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),
        max_features=5000,
        lowercase=True
    )
    
    # Fit and transform the combined features
    tfidf_matrix = vectorizer.fit_transform(df['combined_features'])
    
    print(f"Loaded {len(df)} movies")
    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")

def get_recommendations(favorite_movie_titles, top_n=5):
    """
    Get movie recommendations based on user's favorite movies
    
    Args:
        favorite_movie_titles: List of movie titles the user selected
        top_n: Number of recommendations to return
    
    Returns:
        List of recommended movies with similarity scores
    """
    global df, tfidf_matrix, vectorizer
    
    # Find indices of favorite movies
    favorite_indices = []
    for title in favorite_movie_titles:
        matches = df[df['title'].str.lower() == title.lower()]
        if not matches.empty:
            favorite_indices.append(matches.index[0])
    
    if not favorite_indices:
        return []
    
    # Get TF-IDF vectors for favorite movies
    favorite_vectors = tfidf_matrix[favorite_indices]
    
    # Average the vectors of favorite movies to create a user profile
    user_profile_vector = np.mean(favorite_vectors.toarray(), axis=0)
    
    # Calculate cosine similarity between user profile and all movies
    similarities = cosine_similarity(user_profile_vector.reshape(1, -1), tfidf_matrix).flatten()
    
    # Get top N recommendations (excluding the favorites themselves)
    top_indices = similarities.argsort()[-top_n-len(favorite_indices):][::-1]
    
    # Filter out favorite movies and get top N
    recommendations = []
    seen_titles = set([title.lower() for title in favorite_movie_titles])
    
    for idx in top_indices:
        movie_title = df.iloc[idx]['title']
        if movie_title.lower() not in seen_titles:
            recommendations.append({
                'title': movie_title,
                'genres': df.iloc[idx]['genres'],
                'keywords': df.iloc[idx]['keywords'],
                'rating': float(df.iloc[idx]['rating']) if pd.notna(df.iloc[idx]['rating']) else 0.0,
                'similarity_score': float(similarities[idx])
            })
            seen_titles.add(movie_title.lower())
            if len(recommendations) >= top_n:
                break
    
    return recommendations

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_file('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)"""
    if filename in ['style.css', 'script.js']:
        return send_file(filename)
    return send_file('index.html')  # Fallback for SPA routing

@app.route('/api/movies', methods=['GET'])
def get_movies():
    """Get list of all available movies"""
    global df
    if df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500
    
    movies = df[['title', 'genres', 'rating']].to_dict('records')
    return jsonify(movies)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """Get movie recommendations based on user's favorite movies"""
    global df
    
    if df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500
    
    data = request.get_json()
    
    if not data or 'favorites' not in data:
        return jsonify({'error': 'Please provide a list of favorite movies'}), 400
    
    favorite_movies = data['favorites']
    
    if not isinstance(favorite_movies, list) or len(favorite_movies) == 0:
        return jsonify({'error': 'Favorites must be a non-empty list'}), 400
    
    if len(favorite_movies) > 10:
        return jsonify({'error': 'Please select at most 10 favorite movies'}), 400
    
    # Get recommendations
    recommendations = get_recommendations(favorite_movies, top_n=5)
    
    if not recommendations:
        return jsonify({'error': 'No recommendations found. Please check your movie selections.'}), 404
    
    return jsonify({
        'recommendations': recommendations,
        'count': len(recommendations)
    })

if __name__ == '__main__':
    print("Loading movie dataset and preprocessing...")
    load_and_preprocess_data()
    print("Starting Flask server...")
    app.run(debug=True, port=5000)

