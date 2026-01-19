// RBRepacks - Main Script
const SITE_PASSWORD = "rb2024"; // HESLO PRO PŘÍSTUP NA STRÁNKU

document.addEventListener('DOMContentLoaded', function() {
    // Password elements
    const passwordScreen = document.getElementById('passwordScreen');
    const mainContent = document.getElementById('mainContent');
    const sitePasswordInput = document.getElementById('sitePassword');
    const submitPasswordBtn = document.getElementById('submitPassword');
    const passwordError = document.getElementById('passwordError');
    
    // Main elements
    const gamesContainer = document.getElementById('gamesContainer');
    const loadingElement = document.getElementById('loading');
    const noGamesElement = document.getElementById('noGames');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const genreFilter = document.getElementById('genreFilter');
    const sortFilter = document.getElementById('sortFilter');
    const totalGamesElement = document.getElementById('totalGames');
    const totalSizeElement = document.getElementById('totalSize');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    let allGames = [];
    let filteredGames = [];
    
    // Check if already unlocked
    const isUnlocked = localStorage.getItem('rb_unlocked') === 'true';
    
    if (isUnlocked) {
        // Already unlocked, show main content
        passwordScreen.style.display = 'none';
        mainContent.style.display = 'block';
        initSite();
    } else {
        // Show password screen
        passwordScreen.style.display = 'flex';
        mainContent.style.display = 'none';
        sitePasswordInput.focus();
    }
    
    // Password check
    function checkPassword() {
        const enteredPassword = sitePasswordInput.value.trim();
        
        if (enteredPassword === SITE_PASSWORD) {
            // Correct password
            localStorage.setItem('rb_unlocked', 'true');
            passwordScreen.style.display = 'none';
            mainContent.style.display = 'block';
            initSite();
        } else {
            // Wrong password
            passwordError.style.display = 'block';
            sitePasswordInput.style.borderColor = 'var(--red)';
            sitePasswordInput.value = '';
            sitePasswordInput.focus();
        }
    }
    
    // Password event listeners
    submitPasswordBtn.addEventListener('click', checkPassword);
    sitePasswordInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
        passwordError.style.display = 'none';
        sitePasswordInput.style.borderColor = '#2d2d2d';
    });
    
    // Initialize site after password
    function initSite() {
        // Load games
        loadGames();
        
        // Event listeners for search/filters
        searchBtn.addEventListener('click', filterGames);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') filterGames();
        });
        genreFilter.addEventListener('change', filterGames);
        sortFilter.addEventListener('change', filterGames);
    }
    
    // Load games function
    async function loadGames() {
        try {
            // Show loading
            loadingElement.style.display = 'block';
            noGamesElement.style.display = 'none';
            
            // Try to load from localStorage first (from admin)
            const localGames = localStorage.getItem('rb_games');
            
            if (localGames && localGames !== 'null' && localGames !== 'undefined') {
                allGames = JSON.parse(localGames);
                console.log('Loaded from localStorage:', allGames.length, 'games');
            } else {
                // If no localStorage, try games.json
                const response = await fetch('games.json');
                if (!response.ok) {
                    throw new Error('games.json not found');
                }
                const data = await response.json();
                allGames = data.games || [];
                console.log('Loaded from games.json:', allGames.length, 'games');
            }
            
            // Update games
            filteredGames = [...allGames];
            updateStats();
            displayGames();
            
            // Hide loading
            loadingElement.style.display = 'none';
            
            // Show no games message if empty
            if (allGames.length === 0) {
                noGamesElement.style.display = 'block';
            } else {
                noGamesElement.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading games:', error);
            loadingElement.innerHTML = `
                <div style="color: var(--red);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>Error loading games</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-download" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }
    
    // Update statistics
    function updateStats() {
        totalGamesElement.textContent = allGames.length;
        
        // Calculate total size
        let totalSizeGB = 0;
        allGames.forEach(game => {
            if (game.size) {
                const sizeMatch = game.size.match(/[\d.]+/);
                if (sizeMatch) {
                    totalSizeGB += parseFloat(sizeMatch[0]);
                }
            }
        });
        totalSizeElement.textContent = totalSizeGB.toFixed(1) + ' GB';
        
        // Last updated date
        if (allGames.length > 0) {
            const dates = allGames
                .map(g => g.repackDate || g.releaseDate)
                .filter(d => d)
                .sort()
                .reverse();
            
            if (dates.length > 0) {
                lastUpdatedElement.textContent = dates[0];
            } else {
                lastUpdatedElement.textContent = '-';
            }
        }
    }
    
    // Display games
    function displayGames() {
        gamesContainer.innerHTML = '';
        
        if (filteredGames.length === 0) {
            noGamesElement.style.display = 'block';
            return;
        }
        
        noGamesElement.style.display = 'none';
        
        filteredGames.forEach(game => {
            const gameCard = createGameCard(game);
            gamesContainer.appendChild(gameCard);
        });
    }
    
    // Create game card
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Create stars
        const rating = game.rating || 0;
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '★';
            } else if (i === fullStars + 1 && halfStar) {
                stars += '½';
            } else {
                stars += '☆';
            }
        }
        
        // Create download button
        let downloadBtn = '';
        if (game.downloadLinks) {
            if (game.downloadLinks.direct && game.downloadLinks.direct !== 'null') {
                downloadBtn = `<a href="${game.downloadLinks.direct}" class="btn btn-download" target="_blank"><i class="fas fa-download"></i> DOWNLOAD</a>`;
            } else if (game.downloadLinks.magnet && game.downloadLinks.magnet !== 'null') {
                downloadBtn = `<a href="${game.downloadLinks.magnet}" class="btn btn-download"><i class="fas fa-magnet"></i> MAGNET</a>`;
            } else if (game.downloadLinks.torrent && game.downloadLinks.torrent !== 'null') {
                downloadBtn = `<a href="${game.downloadLinks.torrent}" class="btn btn-download"><i class="fas fa-file-torrent"></i> TORRENT</a>`;
            }
        }
        
        // Fallback if no download links
        if (!downloadBtn) {
            downloadBtn = '<button class="btn btn-download"><i class="fas fa-download"></i> DOWNLOAD</button>';
        }
        
        card.innerHTML = `
            <div class="game-image">
                <img src="${game.imageUrl || 'https://via.placeholder.com/400x200/1a1a1a/8a2be2?text=NO+IMAGE'}" 
                     alt="${game.title}"
                     onerror="this.src='https://via.placeholder.com/400x200/1a1a1a/8a2be2?text=${encodeURIComponent(game.title.substring(0, 20))}'">
            </div>
            <div class="game-content">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-meta">
                    <span>${game.repacker || 'Unknown'}</span>
                    <span>${game.version || 'v1.0'}</span>
                    <span>${game.size || 'N/A'}</span>
                </div>
                <p class="game-description">${game.description || 'No description available.'}</p>
                <div class="game-details">
                    <div>
                        <span class="label">Release Date</span>
                        <span>${game.releaseDate || 'Unknown'}</span>
                    </div>
                    <div>
                        <span class="label">Repack Date</span>
                        <span>${game.repackDate || 'Unknown'}</span>
                    </div>
                    <div>
                        <span class="label">Genre</span>
                        <span>${Array.isArray(game.genre) ? game.genre.join(', ') : game.genre || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="label">Rating</span>
                        <span class="rating"><span class="stars">${stars}</span> ${rating}/5</span>
                    </div>
                </div>
                <div class="buttons">
                    ${downloadBtn}
                    <button class="btn btn-details" onclick="showGameInfo(${game.id})">
                        <i class="fas fa-info-circle"></i> INFO
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Filter games
    function filterGames() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;
        const sortBy = sortFilter.value;
        
        filteredGames = allGames.filter(game => {
            // Search in title, description, repacker
            const matchesSearch = 
                game.title.toLowerCase().includes(searchTerm) ||
                (game.description && game.description.toLowerCase().includes(searchTerm)) ||
                (game.repacker && game.repacker.toLowerCase().includes(searchTerm));
            
            // Filter by genre
            let matchesGenre = true;
            if (selectedGenre) {
                if (Array.isArray(game.genre)) {
                    matchesGenre = game.genre.includes(selectedGenre);
                } else if (typeof game.genre === 'string') {
                    matchesGenre = game.genre.includes(selectedGenre);
                } else {
                    matchesGenre = false;
                }
            }
            
            return matchesSearch && matchesGenre;
        });
        
        // Sort games
        sortGames(sortBy);
        
        // Display filtered games
        displayGames();
    }
    
    // Sort games
    function sortGames(sortBy) {
        switch(sortBy) {
            case 'newest':
                filteredGames.sort((a, b) => {
                    const dateA = new Date(a.repackDate || a.releaseDate || 0);
                    const dateB = new Date(b.repackDate || b.releaseDate || 0);
                    return dateB - dateA;
                });
                break;
                
            case 'rating':
                filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
                
            case 'title':
                filteredGames.sort((a, b) => a.title.localeCompare(b.title));
                break;
                
            default:
                // Newest first by default
                filteredGames.sort((a, b) => {
                    const dateA = new Date(a.repackDate || a.releaseDate || 0);
                    const dateB = new Date(b.repackDate || b.releaseDate || 0);
                    return dateB - dateA;
                });
        }
    }
    
    // Show game info (global function)
    window.showGameInfo = function(gameId) {
        const game = allGames.find(g => g.id === gameId);
        if (!game) return;
        
        let info = `🎮 ${game.title}\n\n`;
        info += `📦 Repacker: ${game.repacker || 'Unknown'}\n`;
        info += `🔢 Version: ${game.version || 'N/A'}\n`;
        info += `💾 Size: ${game.size || 'N/A'}\n`;
        info += `📅 Original Release: ${game.releaseDate || 'Unknown'}\n`;
        info += `🔄 Repack Date: ${game.repackDate || 'Unknown'}\n`;
        info += `🏷️ Genre: ${Array.isArray(game.genre) ? game.genre.join(', ') : game.genre || 'N/A'}\n`;
        info += `⭐ Rating: ${game.rating || 'N/A'}/5\n\n`;
        info += `📝 Description:\n${game.description || 'No description'}\n\n`;
        
        // Download links
        if (game.downloadLinks) {
            info += `🔗 Download Links:\n`;
            if (game.downloadLinks.direct && game.downloadLinks.direct !== 'null') {
                info += `• Direct: ${game.downloadLinks.direct}\n`;
            }
            if (game.downloadLinks.magnet && game.downloadLinks.magnet !== 'null') {
                info += `• Magnet: ${game.downloadLinks.magnet}\n`;
            }
            if (game.downloadLinks.torrent && game.downloadLinks.torrent !== 'null') {
                info += `• Torrent: ${game.downloadLinks.torrent}\n`;
            }
        }
        
        alert(info);
    };
});
