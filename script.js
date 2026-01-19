// Main script for RBRepacks

let allGames = [];
let filteredGames = [];

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const gamesContainer = document.getElementById('gamesContainer');
    const loadingElement = document.getElementById('loading');
    const noResultsElement = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const genreFilter = document.getElementById('genreFilter');
    const sortFilter = document.getElementById('sortFilter');
    const totalGamesElement = document.getElementById('totalGames');
    const totalSizeElement = document.getElementById('totalSize');
    const lastUpdatedElement = document.getElementById('lastUpdated');

    // Load games data
    async function loadGames() {
        try {
            const response = await fetch('data/games.json');
            const data = await response.json();
            allGames = data.games;
            filteredGames = [...allGames];
            
            // Update stats
            updateStats();
            
            // Display games
            displayGames();
            
            // Hide loading
            loadingElement.style.display = 'none';
            
            // Initialize filters
            populateGenreFilter();
        } catch (error) {
            console.error('Error loading games:', error);
            loadingElement.innerHTML = '<p>Error loading games. Please try again later.</p>';
        }
    }

    // Update statistics
    function updateStats() {
        totalGamesElement.textContent = allGames.length;
        
        // Calculate total size
        const totalSize = allGames.reduce((sum, game) => {
            const sizeNum = parseFloat(game.size);
            return isNaN(sizeNum) ? sum : sum + sizeNum;
        }, 0);
        totalSizeElement.textContent = `${totalSize.toFixed(1)} GB`;
        
        // Get last updated date
        if (allGames.length > 0) {
            const latestDate = allGames.reduce((latest, game) => {
                const gameDate = new Date(game.repackDate || game.releaseDate);
                return gameDate > latest ? gameDate : latest;
            }, new Date(0));
            lastUpdatedElement.textContent = latestDate.toLocaleDateString();
        }
    }

    // Populate genre filter
    function populateGenreFilter() {
        const genres = new Set();
        allGames.forEach(game => {
            if (game.genre) {
                game.genre.forEach(g => genres.add(g));
            }
        });
        
        // Sort genres alphabetically
        const sortedGenres = Array.from(genres).sort();
        
        // Add to filter (keeping the "All Genres" option)
        sortedGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }

    // Display games
    function displayGames() {
        gamesContainer.innerHTML = '';
        
        if (filteredGames.length === 0) {
            noResultsElement.style.display = 'block';
            return;
        }
        
        noResultsElement.style.display = 'none';
        
        filteredGames.forEach(game => {
            const gameCard = createGameCard(game);
            gamesContainer.appendChild(gameCard);
        });
    }

    // Create game card HTML
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Create star rating HTML
        const stars = createStarRating(game.rating);
        
        // Format download buttons based on available links
        let downloadButtons = '';
        if (game.downloadLinks) {
            if (game.downloadLinks.direct) {
                downloadButtons += `<a href="${game.downloadLinks.direct}" class="btn btn-download" target="_blank">Direct</a>`;
            }
            if (game.downloadLinks.magnet) {
                downloadButtons += `<a href="${game.downloadLinks.magnet}" class="btn btn-download">Magnet</a>`;
            }
            if (game.downloadLinks.torrent) {
                downloadButtons += `<a href="${game.downloadLinks.torrent}" class="btn btn-download">Torrent</a>`;
            }
        }
        
        card.innerHTML = `
            <div class="game-image">
                <img src="${game.imageUrl}" alt="${game.title}" onerror="this.src='https://via.placeholder.com/300x180/1a1a1a/8a2be2?text=${encodeURIComponent(game.title)}'">
            </div>
            <div class="game-content">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-meta">
                    <span>${game.repacker || 'Unknown'}</span>
                    <span>v${game.version || '1.0'}</span>
                    <span>${game.size || 'N/A'}</span>
                </div>
                <p class="game-description">${game.description || 'No description available.'}</p>
                <div class="game-details">
                    <div>
                        <span>Release Date</span>
                        <span>${game.releaseDate || 'Unknown'}</span>
                    </div>
                    <div>
                        <span>Repack Date</span>
                        <span>${game.repackDate || 'Unknown'}</span>
                    </div>
                    <div>
                        <span>Genre</span>
                        <span>${game.genre ? game.genre.join(', ') : 'N/A'}</span>
                    </div>
                    <div>
                        <span>Rating</span>
                        <span class="rating">${stars} ${game.rating || 'N/A'}</span>
                    </div>
                </div>
                <div class="buttons">
                    ${downloadButtons || '<a href="#" class="btn btn-download">Download</a>'}
                    <button class="btn btn-details" onclick="showGameDetails(${game.id})">Details</button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Create star rating
    function createStarRating(rating) {
        if (!rating) return '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && halfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    // Filter games based on search and filters
    function filterGames() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;
        const sortBy = sortFilter.value;
        
        filteredGames = allGames.filter(game => {
            // Search filter
            const matchesSearch = 
                game.title.toLowerCase().includes(searchTerm) ||
                (game.description && game.description.toLowerCase().includes(searchTerm)) ||
                (game.repacker && game.repacker.toLowerCase().includes(searchTerm)) ||
                (game.genre && game.genre.some(g => g.toLowerCase().includes(searchTerm)));
            
            // Genre filter
            const matchesGenre = !selectedGenre || 
                (game.genre && game.genre.includes(selectedGenre));
            
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
                filteredGames.sort((a, b) => new Date(b.repackDate || b.releaseDate) - new Date(a.repackDate || a.releaseDate));
                break;
            case 'oldest':
                filteredGames.sort((a, b) => new Date(a.repackDate || a.releaseDate) - new Date(b.repackDate || b.releaseDate));
                break;
            case 'rating':
                filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'title':
                filteredGames.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                filteredGames.sort((a, b) => new Date(b.repackDate || b.releaseDate) - new Date(a.repackDate || a.releaseDate));
        }
    }

    // Show game details (modal would be better, but keeping it simple)
    window.showGameDetails = function(gameId) {
        const game = allGames.find(g => g.id === gameId);
        if (!game) return;
        
        // Create a simple alert with details
        let details = `Title: ${game.title}\n`;
        details += `Repacker: ${game.repacker || 'Unknown'}\n`;
        details += `Version: ${game.version || 'N/A'}\n`;
        details += `Size: ${game.size || 'N/A'}\n`;
        details += `Original Size: ${game.originalSize || 'N/A'}\n`;
        details += `Release Date: ${game.releaseDate || 'Unknown'}\n`;
        details += `Repack Date: ${game.repackDate || 'Unknown'}\n`;
        details += `Genre: ${game.genre ? game.genre.join(', ') : 'N/A'}\n`;
        details += `Languages: ${game.language ? game.language.join(', ') : 'N/A'}\n`;
        details += `Rating: ${game.rating || 'N/A'}/5\n`;
        
        if (game.systemRequirements) {
            details += '\nSystem Requirements:\n';
            Object.entries(game.systemRequirements).forEach(([key, value]) => {
                details += `${key}: ${value}\n`;
            });
        }
        
        alert(details);
    }

    // Event Listeners
    searchBtn.addEventListener('click', filterGames);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterGames();
    });
    genreFilter.addEventListener('change', filterGames);
    sortFilter.addEventListener('change', filterGames);

    // Initialize
    loadGames();
});
