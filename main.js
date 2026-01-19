// RBRepacks - Main Script (for visitors)
document.addEventListener('DOMContentLoaded', function() {
    // Elements
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
    
    // Load games from games.json
    async function loadGames() {
        try {
            loadingElement.style.display = 'block';
            
            // Load from games.json
            const response = await fetch('games.json');
            if (!response.ok) throw new Error('games.json not found');
            
            const data = await response.json();
            allGames = data.games || [];
            
            console.log('Loaded', allGames.length, 'games from games.json');
            
            // Update
            filteredGames = [...allGames];
            updateStats();
            displayGames();
            
            loadingElement.style.display = 'none';
            
            if (allGames.length === 0) {
                noGamesElement.style.display = 'block';
            } else {
                noGamesElement.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading games:', error);
            loadingElement.innerHTML = `
                <div style="color: var(--red);">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading games</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    function updateStats() {
        totalGamesElement.textContent = allGames.length;
        
        let totalSizeGB = 0;
        allGames.forEach(game => {
            if (game.size) {
                const match = game.size.match(/(\d+(\.\d+)?)/);
                if (match) totalSizeGB += parseFloat(match[1]);
            }
        });
        totalSizeElement.textContent = totalSizeGB.toFixed(1) + ' GB';
        
        if (allGames.length > 0) {
            const dates = allGames
                .map(g => g.repackDate || g.releaseDate)
                .filter(d => d)
                .sort()
                .reverse();
            if (dates.length > 0) {
                lastUpdatedElement.textContent = dates[0];
            }
        }
    }
    
    function displayGames() {
        gamesContainer.innerHTML = '';
        
        if (filteredGames.length === 0) {
            noGamesElement.style.display = 'block';
            return;
        }
        
        noGamesElement.style.display = 'none';
        
        filteredGames.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // Stars
            const rating = game.rating || 0;
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) stars += '★';
                else stars += '☆';
            }
            
            // Download button
            let downloadBtn = '';
            const links = game.downloadLinks || {};
            if (links.direct) {
                downloadBtn = `<a href="${links.direct}" class="btn btn-download" target="_blank"><i class="fas fa-download"></i> DOWNLOAD</a>`;
            } else if (links.magnet) {
                downloadBtn = `<a href="${links.magnet}" class="btn btn-download"><i class="fas fa-magnet"></i> MAGNET</a>`;
            } else if (links.torrent) {
                downloadBtn = `<a href="${links.torrent}" class="btn btn-download"><i class="fas fa-file-torrent"></i> TORRENT</a>`;
            } else {
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
            
            gamesContainer.appendChild(card);
        });
    }
    
    function filterGames() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;
        
        filteredGames = allGames.filter(game => {
            const matchesSearch = 
                game.title.toLowerCase().includes(searchTerm) ||
                (game.description && game.description.toLowerCase().includes(searchTerm)) ||
                (game.repacker && game.repacker.toLowerCase().includes(searchTerm));
            
            let matchesGenre = true;
            if (selectedGenre) {
                if (Array.isArray(game.genre)) {
                    matchesGenre = game.genre.includes(selectedGenre);
                } else if (typeof game.genre === 'string') {
                    matchesGenre = game.genre.includes(selectedGenre);
                }
            }
            
            return matchesSearch && matchesGenre;
        });
        
        // Sort
        const sortBy = sortFilter.value;
        if (sortBy === 'rating') {
            filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'title') {
            filteredGames.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            filteredGames.sort((a, b) => {
                const dateA = new Date(a.repackDate || a.releaseDate || 0);
                const dateB = new Date(b.repackDate || b.releaseDate || 0);
                return dateB - dateA;
            });
        }
        
        displayGames();
    }
    
    window.showGameInfo = function(gameId) {
        const game = allGames.find(g => g.id === gameId);
        if (!game) return;
        
        let info = `🎮 ${game.title}\n\n`;
        info += `📦 Repacker: ${game.repacker || 'Unknown'}\n`;
        info += `🔢 Version: ${game.version || 'N/A'}\n`;
        info += `💾 Size: ${game.size || 'N/A'}\n`;
        info += `📅 Release: ${game.releaseDate || 'Unknown'}\n`;
        info += `🔄 Repack: ${game.repackDate || 'Unknown'}\n`;
        info += `🏷️ Genre: ${Array.isArray(game.genre) ? game.genre.join(', ') : game.genre || 'N/A'}\n`;
        info += `⭐ Rating: ${game.rating || 'N/A'}/5\n\n`;
        info += `📝 ${game.description || 'No description'}`;
        
        alert(info);
    };
    
    // Event listeners
    searchBtn.addEventListener('click', filterGames);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterGames();
    });
    genreFilter.addEventListener('change', filterGames);
    sortFilter.addEventListener('change', filterGames);
    
    // Initial load
    loadGames();
});
