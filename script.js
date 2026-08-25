// Start date: July 10, 2026 (Month index 6 = July)
const startDate = new Date(2026, 6, 10);

function updateCounter() {
  const now = new Date();
  const dateRow = document.getElementById('date-row');
  const timeRow = document.getElementById('time-row');

  // Handle case where start date is in the future
  if (now < startDate) {
    const diffTime = Math.abs(startDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    dateRow.textContent = `Starts in ${diffDays} Days!`;
    timeRow.textContent = `00:00:00`;
    return;
  }

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Display Logic based on Year Anniversary status
  if (years >= 1) {
    dateRow.textContent = `${years} Year${years > 1 ? 's' : ''} ${months} Month${months !== 1 ? 's' : ''} ${days} Day${days !== 1 ? 's' : ''}`;
  } else {
    dateRow.textContent = `${months} Month${months !== 1 ? 's' : ''} ${days} Day${days !== 1 ? 's' : ''}`;
  }

  timeRow.textContent = `${hours} : ${minutes} : ${seconds}`;
}

// Fetch dynamic memories from memories.json
async function loadMemories() {
  const container = document.getElementById('memories-list');
  
  try {
    const response = await fetch('memories.json');
    const memories = await response.json();

    container.innerHTML = memories.map(item => `
      <div class="memory-card glass-panel">
        <span class="badge">${item.category}</span>
        <div class="card-img" style="background-image: url('${item.image || 'https://via.placeholder.com/250x110'}')"></div>
        <div class="card-info">
          <h4>${item.title}</h4>
          <div class="date-text">${item.date}</div>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading memories JSON:', error);
    container.innerHTML = '<p style="font-size: 0.8rem; padding: 10px;">Failed to load memories.</p>';
  }
}

// Run initializations
updateCounter();
setInterval(updateCounter, 1000);
loadMemories();