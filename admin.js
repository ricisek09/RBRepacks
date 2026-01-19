// ZMĚŇ CELÝ admin.js na tohle:

// RBRepacks Admin Script
const ADMIN_PASSWORD = "admin123";

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
        console.log("Admin panel initialized");
        
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                console.log("Switching to tab:", tabId);
                
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
        
        // Load existing games
        let currentGames = loadGamesFromStorage();
        console.log("Loaded games from storage:", currentGames.length);
        
        let currentGenres = [];
        
        // Show message if games exist
        if (currentGames.length > 0) {
            showMessage(`Loaded ${currentGames.length} games from storage`, 'success', 'message');
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
                    <button type="button" onclick="removeGenreAt(${index})" style="background: none; border: none; color: #ff3333; cursor: pointer; font-size: 1.2rem;">×</button>
                `;
                genresContainer.appendChild(tag);
            });
        }
        
        // Make removeGenre available globally
        window.removeGenreAt = function(index) {
            currentGenres.splice(index, 1);
            updateGenresDisplay();
        };
        
        addGenreBtn.addEventListener('click', addGenre);
        genreInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addGenre();
            }
        });
        
        // Form submission - DŮLEŽITÁ ČÁST!
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submitted");
            
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
            
            console.log("Game data:", gameData);
            
            // Validation
            if (!gameData.title || !gameData.repacker || !gameData.imageUrl) {
                showMessage('Please fill required fields (Title, Repacker, Image URL)', 'error', 'message');
                return;
            }
            
            // Add to games array
            currentGames.push(gameData);
            console.log("Total games after add:", currentGames.length);
            
            // Save to localStorage
            saveGamesToStorage(currentGames);
            
            // Show success message
            showMessage(`✅ Game "${gameData.title}" added successfully! Total games: ${currentGames.length}`, 'success', 'message');
            
            // Reset form
            form.reset();
            currentGenres = [];
            updateGenresDisplay();
            document.getElementById('repackDate').value = today;
            
            // Auto-hide message after 3 seconds
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
            console.log("Generating JSON...");
            
            // Reload games from storage to be sure
            currentGames = loadGamesFromStorage();
            console.log("Games for export:", currentGames);
            
            const gamesData = {
                games: currentGames
            };
            
            const jsonString = JSON.stringify(gamesData, null, 2);
            jsonOutput.textContent = jsonString;
            
            exportMessage.textContent = `✅ Generated JSON for ${currentGames.length} games`;
            exportMessage.className = 'message success';
            exportMessage.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                exportMessage.style.display = 'none';
            }, 5000);
        });
        
        copyJsonBtn.addEventListener('click', function() {
            const text = jsonOutput.textContent;
            if (!text || text.includes('JSON will appear here')) {
                exportMessage.textContent = '⚠️ Please generate JSON first!';
                exportMessage.className = 'message error';
                exportMessage.style.display = 'block';
                return;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                exportMessage.textContent = '✅ JSON copied to clipboard!';
                exportMessage.className = 'message success';
                exportMessage.style.display = 'block';
            }).catch(err => {
                exportMessage.textContent = '❌ Failed to copy: ' + err;
                exportMessage.className = 'message error';
                exportMessage.style.display = 'block';
            });
            
            setTimeout(() => {
                exportMessage.style.display = 'none';
            }, 3000);
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
                    importMessage.textContent = '⚠️ Please paste JSON';
                    importMessage.className = 'message error';
                    importMessage.style.display = 'block';
                    return;
                }
                
                const data = JSON.parse(jsonText);
                if (!data.games || !Array.isArray(data.games)) {
                    throw new Error('Invalid JSON format - missing "games" array');
                }
                
                currentGames = data.games;
                saveGamesToStorage(currentGames);
                
                importMessage.textContent = `✅ Imported ${currentGames.length} games successfully!`;
                importMessage.className = 'message success';
                importMessage.style.display = 'block';
                
                setTimeout(() => {
                    importMessage.style.display = 'none';
                }, 3000);
                
            } catch (error) {
                importMessage.textContent = '❌ Error: ' + error.message;
                importMessage.className = 'message error';
                importMessage.style.display = 'block';
                
                setTimeout(() => {
                    importMessage.style.display = 'none';
                }, 5000);
            }
        });
        
        clearGamesBtn.addEventListener('click', function() {
            if (confirm('⚠️ Are you sure you want to delete ALL games from storage?')) {
                currentGames = [];
                saveGamesToStorage(currentGames);
                importMessage.textContent = '✅ All games deleted from storage';
                importMessage.className = 'message success';
                importMessage.style.display = 'block';
                
                setTimeout(() => {
                    importMessage.style.display = 'none';
                }, 3000);
            }
        });
        
        // Helper functions
        function loadGamesFromStorage() {
            try {
                const stored = localStorage.getItem('rb_games');
                console.log("Raw storage:", stored);
                
                if (!stored || stored === 'null' || stored === 'undefined') {
                    return [];
                }
                
                const parsed = JSON.parse(stored);
                console.log("Parsed games:", parsed);
                
                // Ensure it's an array
                if (Array.isArray(parsed)) {
                    return parsed;
                } else if (parsed && parsed.games && Array.isArray(parsed.games)) {
                    return parsed.games;
                } else {
                    return [];
                }
                
            } catch (error) {
                console.error("Error loading from storage:", error);
                return [];
            }
        }
        
        function saveGamesToStorage(games) {
            console.log("Saving to storage:", games);
            localStorage.setItem('rb_games', JSON.stringify(games));
        }
        
        function showMessage(text, type, elementId = 'message') {
            const msgElement = document.getElementById(elementId);
            if (msgElement) {
                msgElement.textContent = text;
                msgElement.className = `message ${type}`;
                msgElement.style.display = 'block';
            }
        }
        
        // Load any existing JSON from games.json for reference
        fetch('games.json')
            .then(response => response.json())
            .then(data => {
                if (data.games && data.games.length > 0) {
                    console.log("Loaded from games.json:", data.games.length, "games");
                }
            })
            .catch(err => console.log("No games.json or error:", err));
    }
});
