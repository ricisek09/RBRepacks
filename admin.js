// RBRepacks Admin - Simple Game Adder

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('gameForm');
    const genreInput = document.getElementById('genreInput');
    const addGenreBtn = document.getElementById('addGenreBtn');
    const genresContainer = document.getElementById('genresContainer');
    const messageElement = document.getElementById('message');
    
    // Current genres
    let currentGenres = [];
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('repackDate').value = today;
    
    // Add genre
    addGenreBtn.addEventListener('click', addGenre);
    genreInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addGenre();
        }
    });
    
    function addGenre() {
        const genre = genreInput.value.trim();
        if (genre && !currentGenres.includes(genre)) {
            currentGenres.push(genre);
            updateGenresDisplay();
            genreInput.value = '';
            genreInput.focus();
        }
    }
    
    function removeGenre(index) {
        currentGenres.splice(index, 1);
        updateGenresDisplay();
    }
    
    function updateGenresDisplay() {
        genresContainer.innerHTML = '';
        currentGenres.forEach((genre, index) => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.innerHTML = `
                ${genre}
                <span class="tag-remove" onclick="removeGenre(${index})">×</span>
            `;
            genresContainer.appendChild(tag);
        });
    }
    
    // Make removeGenre available globally
    window.removeGenre = removeGenre;
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const gameData = {
            id: Date.now(), // Unique ID
            title: document.getElementById('title').value.trim(),
            repacker: document.getElementById('repacker').value.trim(),
            version: document.getElementById('version').value.trim(),
            size: document.getElementById('size').value.trim() + ' GB',
            description: document.getElementById('description').value.trim(),
            imageUrl: document.getElementById('imageUrl').value.trim(),
            releaseDate: document.getElementById('releaseDate').value,
            repackDate: document.getElementById('repackDate').value || today,
            genre: currentGenres.length > 0 ? currentGenres : ['Other'],
            rating: parseFloat(document.getElementById('rating').value),
            downloadLinks: {
                direct: document.getElementById('directLink').value.trim() || null,
                magnet: document.getElementById('magnetLink').value.trim() || null,
                torrent: document.getElementById('torrentLink').value.trim() || null
            }
        };
        
        // Validation
        if (!gameData.title || !gameData.repacker || !gameData.imageUrl) {
            showMessage('Please fill in all required fields (Title, Repacker, Image URL)', 'error');
            return;
        }
        
        // Save to localStorage
        saveGame(gameData);
    });
    
    function saveGame(gameData) {
        try {
            // Get existing games from localStorage
            let existingGames = [];
            const storedGames = localStorage.getItem('rb_games');
            
            if (storedGames) {
                existingGames = JSON.parse(storedGames);
            }
            
            // Add new game
            existingGames.push(gameData);
            
            // Save back to localStorage
            localStorage.setItem('rb_games', JSON.stringify(existingGames));
            
            // Show success message
            showMessage(`🎮 "${gameData.title}" was added successfully!`, 'success');
            
            // Reset form
            form.reset();
            currentGenres = [];
            updateGenresDisplay();
            
            // Reset dates
            document.getElementById('repackDate').value = today;
            
            // Auto-scroll to top
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error('Error saving game:', error);
            showMessage('Error saving game. Please try again.', 'error');
        }
    }
    
    function showMessage(text, type) {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
});
