// RBRepacks Admin Script
const ADMIN_PASSWORD = "admin123"; // HESLO PRO ADMIN PANEL

document.addEventListener('DOMContentLoaded', function() {
    // Password elements
    const adminPasswordScreen = document.getElementById('adminPasswordScreen');
    const adminContent = document.getElementById('adminContent');
    const adminPasswordInput = document.getElementById('adminPassword');
    const submitAdminPasswordBtn = document.getElementById('submitAdminPassword');
    const adminPasswordError = document.getElementById('adminPasswordError');
    
    // Check if already logged in
    const isAdminLoggedIn = localStorage.getItem('rb_admin_loggedin') === 'true';
    
    if (isAdminLoggedIn) {
        // Already logged in
        adminPasswordScreen.style.display = 'none';
        adminContent.style.display = 'block';
        initAdminPanel();
    } else {
        // Show password screen
        adminPasswordScreen.style.display = 'flex';
        adminContent.style.display = 'none';
        adminPasswordInput.focus();
    }
    
    // Admin password check
    function checkAdminPassword() {
        const enteredPassword = adminPasswordInput.value.trim();
        
        if (enteredPassword === ADMIN_PASSWORD) {
            // Correct password
            localStorage.setItem('rb_admin_loggedin', 'true');
            adminPasswordScreen.style.display = 'none';
            adminContent.style.display = 'block';
            initAdminPanel();
        } else {
            // Wrong password
            adminPasswordError.style.display = 'block';
            adminPasswordInput.style.borderColor = 'var(--red)';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }
    
    // Admin password event listeners
    submitAdminPasswordBtn.addEventListener('click', checkAdminPassword);
    adminPasswordInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            checkAdminPassword();
        }
        adminPasswordError.style.display = 'none';
        adminPasswordInput.style.borderColor = '#2d2d2d';
    });
    
    // Initialize admin panel
    function initAdminPanel() {
        // Form elements
        const form = document.getElementById('gameForm');
        const genreInput = document.getElementById('genreInput');
        const addGenreBtn = document.getElementById('addGenreBtn');
        const genresContainer = document.getElementById('genresContainer');
        const messageElement = document.getElementById('message');
        
        // Current genres
        let currentGenres = [];
        
        // Set today's date as default for repack date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('repackDate').value = today;
        
        // Add genre function
        function addGenre() {
            const genre = genreInput.value.trim();
            if (genre && !currentGenres.includes(genre)) {
                currentGenres.push(genre);
                updateGenresDisplay();
                genreInput.value = '';
                genreInput.focus();
            }
        }
        
        // Remove genre
        function removeGenre(index) {
            currentGenres.splice(index, 1);
            updateGenresDisplay();
        }
        
        // Update genres display
        function updateGenresDisplay() {
            genresContainer.innerHTML = '';
            currentGenres.forEach((genre, index) => {
                const tag = document.createElement('div');
                tag.className = 'tag';
                tag.innerHTML = `
                    ${genre}
                    <button type="button" class="tag-remove" onclick="removeAdminGenre(${index})">×</button>
                `;
                genresContainer.appendChild(tag);
            });
        }
        
        // Make removeGenre available globally
        window.removeAdminGenre = removeGenre;
        
        // Event listeners for genres
        addGenreBtn.addEventListener('click', addGenre);
        genreInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addGenre();
            }
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const gameData = {
                id: Date.now(), // Unique ID based on timestamp
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
            
            // Save game
            saveGame(gameData);
        });
        
        // Save game function
        function saveGame(gameData) {
            try {
                // Get existing games from localStorage
                let existingGames = [];
                const storedGames = localStorage.getItem('rb_games');
                
                if (storedGames && storedGames !== 'null' && storedGames !== 'undefined') {
                    existingGames = JSON.parse(storedGames);
                }
                
                // Add new game
                existingGames.push(gameData);
                
                // Save back to localStorage
                localStorage.setItem('rb_games', JSON.stringify(existingGames));
                
                // Show success message
                showMessage(`🎮 Game "${gameData.title}" added successfully! Total games: ${existingGames.length}`, 'success');
                
                // Reset form
                form.reset();
                currentGenres = [];
                updateGenresDisplay();
                
                // Reset dates
                document.getElementById('repackDate').value = today;
                
                // Auto-scroll to top
                window.scrollTo(0, 0);
                
                // Auto-clear message after 5 seconds
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 5000);
                
            } catch (error) {
                console.error('Error saving game:', error);
                showMessage('Error saving game. Please try again.', 'error');
            }
        }
        
        // Show message function
        function showMessage(text, type) {
            messageElement.textContent = text;
            messageElement.className = `message ${type}`;
            messageElement.style.display = 'block';
        }
    }
});
