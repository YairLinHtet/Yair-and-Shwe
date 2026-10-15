// Start date: July 10, 2026 (Month index 6 = July)
const startDate = new Date(2026, 6, 10);

function updateCounter() {
  const now = new Date();
  const dateRow = document.getElementById("date-row");
  const totalDaysRow = document.getElementById("total-days-row");
  const timeRow = document.getElementById("time-row");

  if (now < startDate) {
    const diffTime = Math.abs(startDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    dateRow.textContent = `Starts in ${diffDays} Days!`;
    if (totalDaysRow) totalDaysRow.textContent = `(0 Days)`;
    timeRow.textContent = `00:00:00`;
    return;
  }

  // Calculate total elapsed days
  const diffTime = now - startDate;
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Calculate Years, Months, Days
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

  if (years >= 1) {
    dateRow.textContent = `${years} Year${years > 1 ? "s" : ""} ${months} Month${months !== 1 ? "s" : ""} ${days} Day${days !== 1 ? "s" : ""}`;
  } else {
    dateRow.textContent = `${months} Month${months !== 1 ? "s" : ""} ${days} Day${days !== 1 ? "s" : ""}`;
  }

  if (totalDaysRow) {
    totalDaysRow.textContent = `(${totalDays} Days)`;
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

  document.querySelectorAll(".card-img").forEach((imgCard) => {
    imgCard.addEventListener("click", () => {
      const imgSrc = imgCard.getAttribute("data-img");
      if (imgSrc) {
        modalImg.src = imgSrc;
        modal.classList.add("active");
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  }
}

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

function toggleExpand(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.toggle("expanded");
  }
}

// Declare active track state globally
let currentPlayingId = null;

function toggleAudio(trackId) {
  const audioElement = document.getElementById(`audio-${trackId}`);
  const playBtn = document.querySelector(`#track-${trackId} .play-btn`);
  const progressBar = document.getElementById(`progress-${trackId}`);

  if (!audioElement) return;

  // Stop currently playing track if switching to a new track
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
      prevAudio.currentTime = 0; // Reset position to match progress bar reset
    }
    if (prevBtn) prevBtn.textContent = "▶";
    if (prevProgress) prevProgress.style.width = "0%";
  }

  // Attach event listeners once per audio element
  if (!audioElement.dataset.listenersAttached) {
    audioElement.addEventListener("timeupdate", () => {
      if (progressBar && audioElement.duration) {
        const percentage =
          (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = `${percentage}%`;
      }
    });

    audioElement.addEventListener("ended", () => {
      if (playBtn) playBtn.textContent = "▶";
      if (progressBar) progressBar.style.width = "0%";
      audioElement.currentTime = 0;
      currentPlayingId = null;
    });

    audioElement.dataset.listenersAttached = "true";
  }

  // Toggle Play / Pause
  if (audioElement.paused) {
    audioElement.play();
    if (playBtn) playBtn.textContent = "❚❚";
    currentPlayingId = trackId;
  } else {
    audioElement.pause();
    if (playBtn) playBtn.textContent = "▶";
    currentPlayingId = null;
  }
}

/* ================= FLOATING WIDGET TOGGLE LOGIC ================= */
function setupFloatingWidget() {
  const ball = document.getElementById("floating-ball");
  const menu = document.getElementById("floating-menu");

  if (!ball || !menu) return;

  // Prevent drag default
  ball.addEventListener("dragstart", (e) => e.preventDefault());

  // Toggle menu smooth popup without layout shift
  ball.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const widget = document.getElementById("floating-widget");
    if (widget && !widget.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });

  // Close menu when a navigation link is clicked
  document.querySelectorAll(".floating-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
    });
  });
}

/* ================= APP LOADING SCREEN LOGIC ================= */
function setupLoadingScreen() {
  const loadingScreen = document.getElementById("app-loading-screen");
  if (!loadingScreen) return;

  // Custom Loading Screen ကို မည်သည့်နေရာမှဖွင့်ဖွင့် 2.2 စက္ကန့်အကြာတွင် Fade-out လုပ်မည်
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
  }, 2200);
}

/* ================= PWA INSTALLATION SYSTEM ================= */
let deferredPrompt = null;

function setupPWA() {
  const pwaInstallNavBtn = document.getElementById("pwa-install-nav-btn");
  const pwaModal = document.getElementById("pwa-modal");
  const pwaModalClose = document.getElementById("pwa-modal-close");
  const pwaInstallBtn = document.getElementById("pwa-install-btn");
  const pwaNativeBox = document.getElementById("pwa-native-box");
  const pwaIosInstructions = document.getElementById("pwa-ios-instructions");

  // App ကို Install ပြုလုပ်ပြီးပါက သို့မဟုတ် App (Standalone Mode) ဖြင့် သုံးနေပါက Button ကို ဖျောက်မည်
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone;

  if (isStandalone && pwaInstallNavBtn) {
    pwaInstallNavBtn.style.display = "none";
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("Service Worker Registered successfully.");
        reg.update();
      })
      .catch((err) =>
        console.error("Service Worker Registration failed:", err),
      );
  }

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // App ကို Install ပြုလုပ်ပြီးသွားသည့် Event ကို စောင့်ကြည့်ပြီး Button ကို ဖျောက်မည်
  window.addEventListener("appinstalled", () => {
    console.log("PWA installed successfully.");
    if (pwaInstallNavBtn) {
      pwaInstallNavBtn.style.display = "none";
    }
    if (pwaModal) {
      pwaModal.classList.remove("active");
    }
    deferredPrompt = null;
  });

  if (pwaInstallNavBtn) {
    pwaInstallNavBtn.addEventListener("click", () => {
      const menu = document.getElementById("floating-menu");
      if (menu) menu.classList.add("hidden");
      if (pwaModal) pwaModal.classList.add("active");

      if (deferredPrompt) {
        if (pwaNativeBox) pwaNativeBox.style.display = "block";
        if (pwaIosInstructions) pwaIosInstructions.style.display = "none";
      } else if (isIOS) {
        if (pwaNativeBox) pwaNativeBox.style.display = "none";
        if (pwaIosInstructions) pwaIosInstructions.style.display = "block";
      } else {
        if (pwaNativeBox) pwaNativeBox.style.display = "block";
        if (pwaIosInstructions) pwaIosInstructions.style.display = "none";
      }
    });
  }

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User prompt outcome: ${outcome}`);
        if (outcome === "accepted") {
          if (pwaInstallNavBtn) pwaInstallNavBtn.style.display = "none";
        }
        deferredPrompt = null;
        if (pwaModal) pwaModal.classList.remove("active");
      } else {
        alert(
          'Browser မူလ Install Prompt အဆင်မသင့်ပါက Browser Menu ထဲရှိ "Add to Home Screen" ကို အသုံးပြုပေးပါ။',
        );
      }
    });
  }

  if (pwaModalClose) {
    pwaModalClose.addEventListener("click", () => {
      if (pwaModal) pwaModal.classList.remove("active");
    });
  }

  if (pwaModal) {
    pwaModal.addEventListener("click", (e) => {
      if (e.target === pwaModal) {
        pwaModal.classList.remove("active");
      }
    });
  }
}

async function loadFavorites() {
  try {
    const response = await fetch("favorites.json");
    const data = await response.json();

    // Load Movies
    renderMediaCategory("fav-movies-list", data.movies);

    // Load Series
    renderMediaCategory("fav-series-list", data.series);

    // Load Characters
    const charContainer = document.getElementById("fav-characters-list");
    if (charContainer && data.characters) {
      const visible = data.characters.slice(0, 3);
      const hidden = data.characters.slice(3);
      let html = visible.map((c) => createCharHTML(c)).join("");
      if (hidden.length > 0) {
        html += `<div class="expandable-content">${hidden.map((c) => createCharHTML(c)).join("")}</div>`;
      }
      charContainer.innerHTML = html;
    }

    // Load Playlist
    const playlistContainer = document.getElementById("fav-playlist-list");
    if (playlistContainer && data.playlist) {
      const visible = data.playlist.slice(0, 3);
      const hidden = data.playlist.slice(3);
      let html = visible.map((t) => createTrackHTML(t)).join("");
      if (hidden.length > 0) {
        html += `<div class="expandable-content">${hidden.map((t) => createTrackHTML(t)).join("")}</div>`;
      }
      playlistContainer.innerHTML = html;
    }
  } catch (error) {
    console.error("Error loading favorites JSON:", error);
  }
}

function renderMediaCategory(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container || !items) return;

  const visible = items.slice(0, 3);
  const hidden = items.slice(3);

  let html = visible.map((item) => createMediaHTML(item)).join("");
  if (hidden.length > 0) {
    html += `<div class="expandable-content">${hidden.map((item) => createMediaHTML(item)).join("")}</div>`;
  }
  container.innerHTML = html;
}

function createMediaHTML(item) {
  return `
    <div class="media-item">
      <img src="${item.cover}" alt="${item.title}" class="item-cover" />
      <div class="media-info">
        <span class="title">${item.title}</span>
        <span style="font-size: clamp(0.5rem, 0.357rem + 0.714vw, 1rem);" class="year">(${item.year})</span>
      </div>
    </div>
  `;
}

function createCharHTML(item) {
  return `
    <div class="char-info">
      <img src="${item.avatar}" alt="${item.name}" class="avatar-img" />
      <!--change font size for character-->
      <span style="font-size:clamp(0.7rem, 0.614rem + 0.429vw, 1rem); " >${item.name}</span>
    </div>
  `;
}

function createTrackHTML(item) {
  return `
    <div class="playlist-item" id="track-${item.id}">
      <img src="${item.cover}" alt="${item.title}" class="album-art" />
      <div class="track-info">
      <!--change font size for play-->
        <span  class="song-title">${item.title}</span>
        <span  class="artist-name">${item.artist}</span>
        <div class="progress-bar-container">
          <div class="progress-bar" id="progress-${item.id}"></div>
        </div>
      </div>
      <button class="play-btn" onclick="toggleAudio(${item.id})">▶</button>
      <audio id="audio-${item.id}" src="${item.src}"></audio>
    </div>
  `;
}

// Run initializations
document.addEventListener("DOMContentLoaded", () => {
  setupLoadingScreen();
  updateCounter();
  setInterval(updateCounter, 1000);
  loadMemories();
  loadFavorites();
  loadGallery();
  setupFloatingWidget();
  setupPWA();
});
