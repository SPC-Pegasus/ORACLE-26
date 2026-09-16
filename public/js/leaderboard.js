document.addEventListener('DOMContentLoaded', () => {
  // Update this URL if your Next.js/Express backend is hosted on a different domain
  // (e.g., 'https://your-backend.vercel.app/api/live-scores')
  const API_URL = '/api/scores'; 
  
  // DOM Elements
  const podiumContainer = document.querySelector('.podium-container');
  const listContainer = document.querySelector('.list-container');
  
  // Format score helper
  const formatScore = (score) => `${score} PTS`;

  async function fetchLiveScores() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // The API returns { data: [ { teamName: '...', totalPoints: ... }, ... ] }
      
      let teams = result.data.map(team => ({
          name: team.teamName,
          score: team.totalPoints || 0
      }));
      
      // Sort teams descending by score to be safe
      teams.sort((a, b) => b.score - a.score);
      
      updateLeaderboard(teams);
    } catch (error) {
      console.error('Error fetching live scores:', error);
      // Optional: Show an error state in the UI
    }
  }

  function updateLeaderboard(teams) {
    if (!teams || teams.length === 0) return;

    // Podium elements (1st, 2nd, 3rd) -> visually place-1, place-2, place-3
    const place1 = podiumContainer.querySelector('.place-1');
    const place2 = podiumContainer.querySelector('.place-2');
    const place3 = podiumContainer.querySelector('.place-3');

    // Update 1st Place
    if (teams[0] && place1) {
      place1.querySelector('.podium-name').textContent = teams[0].name;
      place1.querySelector('.podium-score').textContent = formatScore(teams[0].score);
    }
    
    // Update 2nd Place
    if (teams[1] && place2) {
      place2.querySelector('.podium-name').textContent = teams[1].name;
      place2.querySelector('.podium-score').textContent = formatScore(teams[1].score);
    }

    // Update 3rd Place
    if (teams[2] && place3) {
      place3.querySelector('.podium-name').textContent = teams[2].name;
      place3.querySelector('.podium-score').textContent = formatScore(teams[2].score);
    }

    // List container (4th onwards)
    if (listContainer) {
      listContainer.innerHTML = ''; // Clear existing items

      for (let i = 3; i < teams.length; i++) {
        const rank = (i + 1).toString().padStart(2, '0');
        const team = teams[i];
        
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        
        listItem.innerHTML = `
          <div class="list-rank">${rank}</div>
          <div class="list-name">${team.name}</div>
          <div class="list-score">${formatScore(team.score)}</div>
        `;
        
        listContainer.appendChild(listItem);
      }
    }
  }

  // Initial fetch on page load
  fetchLiveScores();

  // Poll for updates every 10 seconds
  setInterval(fetchLiveScores, 10000);
});
