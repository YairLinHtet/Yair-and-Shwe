// Start date: July 10, 2026 (Month index 6 = July)
const startDate = new Date(2026, 6, 10);

function updateCounter() {
  const now = new Date();
  const dateRow = document.getElementById("date-row");
  const timeRow = document.getElementById("time-row");

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

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Display Logic based on Year Anniversary status
  if (years >= 1) {
    dateRow.textContent = `${years} Year${years > 1 ? "s" : ""} ${months} Month${months !== 1 ? "s" : ""} ${days} Day${days !== 1 ? "s" : ""}`;
  } else {
    dateRow.textContent = `${months} Month${months !== 1 ? "s" : ""} ${days} Day${days !== 1 ? "s" : ""}`;
  }

  timeRow.textContent = `${hours} : ${minutes} : ${seconds}`;
}

async function loadMemories() {
  const container = document.getElementById("memories-list");

  try {
    const response = await fetch("memories.json");
    const memories = await response.json();

    container.innerHTML = memories
      .map(
        (item) => `
      <div class="memory-card glass-panel">
        <span class="badge">${item.category}</span>
        <div class="card-img" 
             style="background-image: url('${item.image || "https://via.placeholder.com/250x110"}')"
             data-img="${item.image || "https://via.placeholder.com/250x110"}">
        </div>
        <div class="card-info">
          <h4>${item.title}</h4>
          <div class="date-text">${item.date}</div>
          <p>${item.description}</p>
        </div>
      </div>
    `,
      )
      .join("");

    // Setup Click Event for Modal Popup
    setupImageModal();
  } catch (error) {
    console.error("Error loading memories JSON:", error);
    container.innerHTML =
      '<p style="font-size: 0.8rem; padding: 10px;">Failed to load memories.</p>';
  }
}

function setupImageModal() {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const closeBtn = document.querySelector(".modal-close");

  // Click card image to open full size
  document.querySelectorAll(".card-img").forEach((imgCard) => {
    imgCard.addEventListener("click", () => {
      const imgSrc = imgCard.getAttribute("data-img");
      if (imgSrc) {
        modalImg.src = imgSrc;
        modal.classList.add("active");
      }
    });
  });

  // Close modal when clicking 'X'
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // Close modal when clicking outside the image
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

// Fetch dynamic gallery from gallery.json
// Fetch dynamic gallery from gallery.json
async function loadGallery() {
  const container = document.getElementById("gallery-container");

  try {
    const response = await fetch("gallery.json");
    const galleryItems = await response.json();

    container.innerHTML = galleryItems
      .map(
        (item) => `
      <div class="gallery-card">
        <div class="gallery-photo-frame">
          <img src="${item.image || "https://via.placeholder.com/600x338"}" 
               alt="${item.title}" 
               data-img="${item.image || "https://via.placeholder.com/600x338"}" 
               class="gallery-img" />
        </div>
        <div class="gallery-content">
          <h3>${item.title}</h3>
          <p class="gallery-quote">${item.quote}</p>
        </div>
      </div>
    `,
      )
      .join("");

    // Setup Click Event for Gallery Modal Popup
    setupGalleryModal();
  } catch (error) {
    console.error("Error loading gallery JSON:", error);
    container.innerHTML =
      '<p style="font-size: 0.8rem; padding: 10px;">Failed to load gallery items.</p>';
  }
}

function setupGalleryModal() {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");

  // Click gallery image to open full size
  document.querySelectorAll(".gallery-img").forEach((img) => {
    img.addEventListener("click", () => {
      const imgSrc = img.getAttribute("data-img");
      if (imgSrc) {
        modalImg.src = imgSrc;
        modal.classList.add("active");
      }
    });
  });
}

// Expand / Collapse Favorites Function
function toggleExpand(cardId) {
  const card = document.getElementById(cardId);
  card.classList.toggle("expanded");
}

// Global Audio Tracker
let currentPlayingId = null;

function toggleAudio(trackId, audioUrl) {
  const audioElement = document.getElementById(`audio-${trackId}`);
  const playBtn = document.querySelector(`#track-${trackId} .play-btn`);
  const progressBar = document.getElementById(`progress-${trackId}`);

  // Pause previous track if another track is playing
  if (currentPlayingId && currentPlayingId !== trackId) {
    const prevAudio = document.getElementById(`audio-${currentPlayingId}`);
    const prevBtn = document.querySelector(
      `#track-${currentPlayingId} .play-btn`,
    );
    const prevProgress = document.getElementById(
      `progress-${currentPlayingId}`,
    );

    if (prevAudio) {
      prevAudio.pause();
      prevBtn.textContent = "▶";
      prevProgress.style.width = "0%";
    }
  }

  // Play / Pause toggle logic
  if (audioElement.paused) {
    audioElement.play();
    playBtn.textContent = "❚❚";
    currentPlayingId = trackId;

    // Real-time progress bar update
    audioElement.ontimeupdate = () => {
      const percentage =
        (audioElement.currentTime / audioElement.duration) * 100;
      progressBar.style.width = `${percentage}%`;
    };

    // Reset when audio finishes
    audioElement.onended = () => {
      playBtn.textContent = "▶";
      progressBar.style.width = "0%";
      currentPlayingId = null;
    };
  } else {
    audioElement.pause();
    playBtn.textContent = "▶";
    currentPlayingId = null;
  }
}

// Run initializations
updateCounter();
setInterval(updateCounter, 1000);
loadMemories();
loadGallery();
