// RBRepacks - Main Script
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

    // Load games from localStorage or games.json
    async function loadGames() {
        try {
            // First try localStorage (from admin panel)
            const localGames = localStorage.getItem('rb_games');
            
            if (localGames) {
                allGames = JSON.parse(localGames);
                console.log('Loaded from localStorage:', allGames.length, 'games');
            } else {
                // Fallback to games.json
                const response = await fetch('games.json');
                const data = await response.json();
                allGames = data.games || [];
                console.log('Loaded from games.json:', allGames.length, 'games');
            }
            
            filteredGames = [...allGames];
            updateStats();
            displayGames();
            
            // Hide loading
            loadingElement.style.display = 'none';
            
            // Show/hide no games message
            if (allGames.length === 0) {
                noGamesElement.style.display = 'block';
            } else {
                noGamesElement.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading games:', error);
            loadingElement.innerHTML = '<p>Error loading games.</p>';
        }
    }

    // Update statistics
    function updateStats() {
        totalGamesElement.textContent = allGames.length;
        
        // Calculate total size
        let totalSizeGB = 0;
        allGames.forEach(game => {
            const sizeText = game.size || '0 GB';
            const sizeNum = parseFloat(sizeText);
            if (!isNaN(sizeNum)) {
                totalSizeGB += sizeNum;
            }
        });
        totalSizeElement.textContent = totalSizeGB.toFixed(1) + ' GB';
        
        // Last updated
        if (allGames.length > 0) {
            const dates = allGames.map(g => g.repackDate || g.releaseDate).filter(d => d);
            if (dates.length > 0) {
                const latest = dates.sort().reverse()[0];
                lastUpdatedElement.textContent = latest;
            }
        }
    }

    // Display games
    function displayGames() {
        gamesContainer.innerHTML = '';
        
        filteredGames.forEach(game => {
            const gameCard = createGameCard(game);
            gamesContainer.appendChild(gameCard);
        });
    }

    // Create game card
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Star rating
        const rating = game.rating || 0;
        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        
        // Download links
        let downloadBtn = '';
        if (game.downloadLinks) {
            if (game.downloadLinks.direct) {
                downloadBtn = `<a href="${game.downloadLinks.direct}" class="btn btn-download" target="_blank">DOWNLOAD</a>`;
            } else if (game.downloadLinks.magnet) {
                downloadBtn = `<a href="${game.downloadLinks.magnet}" class="btn btn-download">MAGNET</a>`;
            } else if (game.downloadLinks.torrent) {
                downloadBtn = `<a href="${game.downloadLinks.torrent}" class="btn btn-download">TORRENT</a>`;
            }
        }
        
        if (!downloadBtn) {
            downloadBtn = '<button class="btn btn-download">DOWNLOAD</button>';
        }
        
        card.innerHTML = `
            <div class="game-image">
                <img src="${game.imageUrl || 'https://via.placeholder.com/400x200/1a1a1a/8a2be2?text=' + encodeURIComponent(game.title)}" 
                     alt="${game.title}"
                     onerror="this.src='https://via.placeholder.com/400x200/1a1a1a/8a2be2?text=GAME'">
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
                        <span class="label">Release</span>
                        <span>${game.releaseDate || 'Unknown'}</span>
                    </div>
                    <div>
                        <span class="label">Repack Date</span>
                        <span>${game.repackDate || 'Unknown'}</span>
                    </div>
                    <div>
                        <span class="label">Genre</span>
                        <span>${(game.genre || []).join(', ') || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="label">Rating</span>
                        <span class="rating">${stars} ${rating}/5</span>
                    </div>
                </div>
                <div class="buttons">
                    ${downloadBtn}
                    <button class="btn btn-details" onclick="showGameInfo(${game.id})">INFO</button>
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
            // Search
            const matchesSearch = 
                game.title.toLowerCase().includes(searchTerm) ||
                (game.description && game.description.toLowerCase().includes(searchTerm)) ||
                (game.repacker && game.repacker.toLowerCase().includes(searchTerm));
            
            // Genre
            const matchesGenre = !selectedGenre || 
                (game.genre && game.genre.includes(selectedGenre));
            
            return matchesSearch && matchesGenre;
        });
        
        // Sort
        sortGames(sortBy);
        
        // Display
        displayGames();
    }

    // Sort games
    function sortGames(sortBy) {
        switch(sortBy) {
            case 'newest':
                filteredGames.sort((a, b) => (b.repackDate || '').localeCompare(a.repackDate || ''));
                break;
            case 'oldest':
                filteredGames.sort((a, b) => (a.repackDate || '').localeCompare(b.repackDate || ''));
                break;
            case 'rating':
                filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'title':
                filteredGames.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
    }

    // Show game info
    window.showGameInfo = function(gameId) {
        const game = allGames.find(g => g.id === gameId);
        if (!game) return;
        
        let info = `=== ${game.title} ===\n\n`;
        info += `Repacker: ${game.repacker || 'Unknown'}\n`;
        info += `Version: ${game.version || 'N/A'}\n`;
        info += `Size: ${game.size || 'N/A'}\n`;
        info += `Original Release: ${game.releaseDate || 'Unknown'}\n`;
        info += `Repack Date: ${game.repackDate || 'Unknown'}\n`;
        info += `Genre: ${(game.genre || []).join(', ') || 'N/A'}\n`;
        info += `Rating: ${game.rating || 'N/A'}/5\n\n`;
        info += `Description:\n${game.description || 'No description'}\n\n`;
        
        if (game.downloadLinks) {
            info += `Download Links:\n`;
            if (game.downloadLinks.direct) info += `• Direct: ${game.downloadLinks.direct}\n`;
            if (game.downloadLinks.magnet) info += `• Magnet: ${game.downloadLinks.magnet}\n`;
            if (game.downloadLinks.torrent) info += `• Torrent: ${game.downloadLinks.torrent}\n`;
        }
        
        alert(info);
    }

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
