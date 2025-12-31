// Global state
let allMovies = [];
let selectedMovies = [];
let searchTimeout = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadMovies();
    setupEventListeners();
});

// Load all movies from API
async function loadMovies() {
    try {
        const response = await fetch('http://localhost:5000/api/movies');
        if (!response.ok) throw new Error('Failed to load movies');
        
        allMovies = await response.json();
        console.log(`Loaded ${allMovies.length} movies`);
    } catch (error) {
        console.error('Error loading movies:', error);
        showError('Failed to load movies. Make sure the backend server is running.');
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('movieSearch');
    const searchResults = document.getElementById('searchResults');
    const getRecommendationsBtn = document.getElementById('getRecommendations');
    
    // Search input handler
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length === 0) {
            searchResults.classList.remove('active');
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    // Get recommendations button
    getRecommendationsBtn.addEventListener('click', getRecommendations);
    
    // Update button state
    updateButtonState();
}

// Perform movie search
function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    const results = allMovies.filter(movie => {
        const title = movie.title.toLowerCase();
        const genres = (movie.genres || '').toLowerCase();
        return title.includes(query) || genres.includes(query);
    }).slice(0, 10); // Limit to 10 results
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No movies found</div>';
        searchResults.classList.add('active');
        return;
    }
    
    searchResults.innerHTML = results.map(movie => `
        <div class="search-result-item" data-title="${escapeHtml(movie.title)}">
            <div class="title">${escapeHtml(movie.title)}</div>
            <div class="genres">${escapeHtml(movie.genres || 'N/A')}</div>
        </div>
    `).join('');
    
    // Add click handlers to search results
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const title = item.dataset.title;
            addMovieToSelection(title);
            document.getElementById('movieSearch').value = '';
            searchResults.classList.remove('active');
        });
    });
    
    searchResults.classList.add('active');
}

// Add movie to selection
function addMovieToSelection(title) {
    if (selectedMovies.includes(title)) {
        return; // Already selected
    }
    
    selectedMovies.push(title);
    updateSelectedMoviesDisplay();
    updateButtonState();
}

// Remove movie from selection
function removeMovieFromSelection(title) {
    selectedMovies = selectedMovies.filter(m => m !== title);
    updateSelectedMoviesDisplay();
    updateButtonState();
}

// Update selected movies display
function updateSelectedMoviesDisplay() {
    const container = document.getElementById('selectedMoviesList');
    
    if (selectedMovies.length === 0) {
        container.innerHTML = '<p class="placeholder">No movies selected yet</p>';
        return;
    }
    
    container.innerHTML = selectedMovies.map(title => `
        <div class="selected-movie-tag">
            <span>${escapeHtml(title)}</span>
            <button class="remove-btn" onclick="removeMovieFromSelection('${escapeHtml(title)}')" aria-label="Remove">×</button>
        </div>
    `).join('');
}

// Update button state
function updateButtonState() {
    const btn = document.getElementById('getRecommendations');
    btn.disabled = selectedMovies.length < 1;
}

// Get recommendations from API
async function getRecommendations() {
    if (selectedMovies.length === 0) {
        showError('Please select at least one movie');
        return;
    }
    
    const recommendationsSection = document.getElementById('recommendationsSection');
    const container = document.getElementById('recommendationsContainer');
    const btn = document.getElementById('getRecommendations');
    
    // Show loading state
    btn.disabled = true;
    btn.textContent = 'Loading...';
    recommendationsSection.style.display = 'block';
    container.innerHTML = '<div class="loading">🎬 Finding your perfect movies...</div>';
    
    try {
        const response = await fetch('http://localhost:5000/api/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                favorites: selectedMovies
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get recommendations');
        }
        
        const data = await response.json();
        displayRecommendations(data.recommendations);
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Get Recommendations';
    }
}

// Display recommendations
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationsContainer');
    
    if (recommendations.length === 0) {
        container.innerHTML = '<div class="error">No recommendations found. Try selecting different movies.</div>';
        return;
    }
    
    container.innerHTML = recommendations.map((movie, index) => {
        const genres = (movie.genres || '').split('|').filter(g => g.trim());
        const similarityPercent = Math.round(movie.similarity_score * 100);
        
        return `
            <div class="movie-card" style="animation-delay: ${index * 0.1}s">
                <div class="movie-card-header">
                    <div class="movie-card-title">${escapeHtml(movie.title)}</div>
                    <div class="movie-card-rating">
                        ⭐ ${movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                    </div>
                </div>
                <div class="movie-card-body">
                    <div class="movie-card-genres">
                        ${genres.map(genre => `
                            <span class="genre-tag">${escapeHtml(genre.trim())}</span>
                        `).join('')}
                    </div>
                    <div class="movie-card-keywords">
                        <strong>Keywords:</strong> ${escapeHtml(movie.keywords || 'N/A')}
                    </div>
                    <div class="movie-card-similarity">
                        <span>Match: ${similarityPercent}%</span>
                        <div class="similarity-bar">
                            <div class="similarity-fill" style="width: ${similarityPercent}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to recommendations
    document.getElementById('recommendationsSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Show error message
function showError(message) {
    const recommendationsSection = document.getElementById('recommendationsSection');
    const container = document.getElementById('recommendationsContainer');
    
    recommendationsSection.style.display = 'block';
    container.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make removeMovieFromSelection available globally for onclick handlers
window.removeMovieFromSelection = removeMovieFromSelection;

