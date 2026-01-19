// Admin script for adding games

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('gameForm');
    const genreInput = document.getElementById('genreInput');
    const addGenreBtn = document.getElementById('addGenre');
    const genresContainer = document.getElementById('genresContainer');
    const messageElement = document.getElementById('message');
    
    let genres = [];
    let nextId = 1;
    
    // Load existing games to determine next ID
    async function loadExistingGames() {
        try {
            const response = await fetch('data/games.json');
            const data = await response.json();
            if (data.games && data
