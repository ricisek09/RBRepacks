// RBRepacks Admin Script
const ADMIN_PASSWORD = "admin123"; // ZMĚŇ SI HESLO!

document.addEventListener('DOMContentLoaded', function() {
    // Password elements
    const passwordScreen = document.getElementById('passwordScreen');
    const adminContent = document.getElementById('adminContent');
    const adminPasswordInput = document.getElementById('adminPassword');
    const submitPasswordBtn = document.getElementById('submitPassword');
    const passwordError = document.getElementById('passwordError');
    
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('rb_admin_loggedin') === 'true';
    
    if (isLoggedIn) {
        passwordScreen.style.display = 'none';
        adminContent.style.display = 'block';
        initAdminPanel();
    } else {
        passwordScreen.style.display = 'flex';
        adminPasswordInput.focus();
    }
    
    // Password check
    submitPasswordBtn.addEventListener('click', function() {
        if (adminPasswordInput.value === ADMIN_PASSWORD) {
            localStorage.setItem('rb_admin_loggedin', 'true');
            passwordScreen.style.display = 'none';
            adminContent.style.display = 'block';
            initAdminPanel();
        } else {
            passwordError.style.display = 'block';
            adminPasswordInput.style.borderColor = '#ff3333';
        }
    });
    
    adminPasswordInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') submitPasswordBtn.click();
        passwordError.style.display = 'none';
        adminPasswordInput.style.borderColor = '#2d2d2d';
    });
    
    // Initialize admin panel
    function initAdminPanel() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update content
                tabContents.forEach(c => c.classList.remove('active'));
                document.getElementById(tabId + 'Tab').classList.add('active');
            });
        });
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('repackDate').value = today;
        
        // Current games storage
        let currentGames = loadGamesFromStorage();
        let currentGenres = [];
        
        // Load existing games if any
        if (currentGames.length > 0) {
            showMessage(`Loaded ${currentGames.length} games from storage`, 'success');
        }
        
        // Add Game Form
        const form = document.getElementById('gameForm');
        const genreInput = document.getElementById('genreInput');
        const addGenreBtn = document.getElementById('addGenre');
        const genresContainer = document.getElementById('genresContainer');
        const messageElement = document.getElementById('message');
        
        // Genre functions
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
                    <button type="button" onclick="removeGenreAt(${index})" style="background: none; border: none; color: #ff3333; cursor: pointer;">×</button>
                `;
                genresContainer.appendChild(tag);
            });
        }
        
        window.removeGenreAt = removeGenre;
        
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
            
            const gameData = {
                id: Date.now(),
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
            
            if (!gameData.title || !gameData.repacker || !gameData.imageUrl) {
                showMessage('Please fill required fields', 'error');
                return;
            }
            
            // Add to games
            currentGames.push(gameData);
            saveGamesToStorage(currentGames);
            
            // Success
            showMessage(`Game "${gameData.title}" added! Total: ${currentGames.length}`, 'success');
            
            // Reset form
            form.reset();
            currentGenres = [];
            updateGenresDisplay();
            document.getElementById('repackDate').value = today;
            
            // Auto-hide message
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        });
        
        // Export functions
        const generateJsonBtn = document.getElementById('generateJson');
        const copyJsonBtn = document.getElementById('copyJson');
        const jsonOutput = document.getElementById('jsonOutput');
        const exportMessage = document.getElementById('exportMessage');
        
        generateJsonBtn.addEventListener('click', function() {
            const gamesData = {
                games: currentGames
            };
            
            const jsonString = JSON.stringify(gamesData, null, 2);
            jsonOutput.textContent = jsonString;
            
            exportMessage.textContent = `Generated JSON for ${currentGames.length} games`;
            exportMessage.className = 'message success';
            exportMessage.style.display = 'block';
        });
        
        copyJsonBtn.addEventListener('click', function() {
            const text = jsonOutput.textContent;
            if (!text || text === '{/* JSON will appear here */}') {
                exportMessage.textContent = 'Generate JSON first!';
                exportMessage.className = 'message error';
                exportMessage.style.display = 'block';
                return;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                exportMessage.textContent = 'JSON copied to clipboard!';
                exportMessage.className = 'message success';
                exportMessage.style.display = 'block';
            }).catch(err => {
                exportMessage.textContent = 'Failed to copy: ' + err;
                exportMessage.className = 'message error';
                exportMessage.style.display = 'block';
            });
        });
        
        // Import functions
        const importBtn = document.getElementById('importBtn');
        const importJsonInput = document.getElementById('importJson');
        const importMessage = document.getElementById('importMessage');
        const clearGamesBtn = document.getElementById('clearGames');
        
        importBtn.addEventListener('click', function() {
            try {
                const jsonText = importJsonInput.value.trim();
                if (!jsonText) {
                    importMessage.textContent = 'Please paste JSON';
                    importMessage.className = 'message error';
                    importMessage.style.display = 'block';
                    return;
                }
                
                const data = JSON.parse(jsonText);
                if (!data.games || !Array.isArray(data.games)) {
                    throw new Error('Invalid JSON format');
                }
                
                currentGames = data.games;
                saveGamesToStorage(currentGames);
                
                importMessage.textContent = `Imported ${currentGames.length} games successfully!`;
                importMessage.className = 'message success';
                importMessage.style.display = 'block';
                
            } catch (error) {
                importMessage.textContent = 'Error: ' + error.message;
                importMessage.className = 'message error';
                importMessage.style.display = 'block';
            }
        });
        
        clearGamesBtn.addEventListener('click', function() {
            if (confirm('Delete ALL games from storage?')) {
                currentGames = [];
                saveGamesToStorage(currentGames);
                importMessage.textContent = 'All games deleted';
                importMessage.className = 'message success';
                importMessage.style.display = 'block';
            }
        });
        
        // Helper functions
        function loadGamesFromStorage() {
            try {
                const stored = localStorage.getItem('rb_games');
                return stored ? JSON.parse(stored) : [];
            } catch {
                return [];
            }
        }
        
        function saveGamesToStorage(games) {
            localStorage.setItem('rb_games', JSON.stringify(games));
        }
        
        function showMessage(text, type) {
            messageElement.textContent = text;
            messageElement.className = `message ${type}`;
            messageElement.style.display = 'block';
        }
    }
});
