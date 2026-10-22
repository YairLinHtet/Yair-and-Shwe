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

  const diffTime = now - startDate;
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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
  if (!container) return;

  try {
    const response = await fetch("memories.json");
    const memories = await response.json();

    container.innerHTML = memories
      .map((item, index) => {
        const positionClass = index % 2 === 0 ? "top" : "bottom";
        const imgSrc = item.image || "images/sh-logo.webp";

        return `
          <div class="timeline-col ${positionClass}">
            <div class="timeline-card-compact glass-panel">
              <div class="compact-img-box" data-img="${imgSrc}">
                <img src="${imgSrc}" alt="${item.title}" loading="lazy" />
              </div>
              <div class="compact-content">
                <div>
                  <h4 class="compact-title">${item.title}</h4>
                  <div class="compact-date">${item.date}</div>
                </div>
                <p class="compact-desc">${item.description}</p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    setupImageModal();
    setupTimelineScroll();
  } catch (error) {
    console.error("Error loading memories JSON:", error);
    container.innerHTML = '<p style="font-size: 0.8rem; text-align: center; padding: 10px; color: #ffffff;">Failed to load memories.</p>';
  }
}

function setupImageModal() {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const closeBtn = document.querySelector(".modal-close");

  if (!modal || !modalImg) return;

  document.querySelectorAll(".compact-img-box").forEach((imgBox) => {
    imgBox.addEventListener("click", () => {
      const imgSrc = imgBox.getAttribute("data-img");
      if (imgSrc) {
        modalImg.src = imgSrc;
        modal.classList.add("active");
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      modal.classList.remove("active");
    }
  });
}

function setupTimelineScroll() {
  const track = document.getElementById("memories-list");
  const leftBtn = document.getElementById("scrollLeftBtn");
  const rightBtn = document.getElementById("scrollRightBtn");

  if (!track || !leftBtn || !rightBtn) return;

  const updateArrowState = () => {
    const tolerance = 5;
    leftBtn.classList.toggle("disabled", track.scrollLeft <= tolerance);
    rightBtn.classList.toggle("disabled", track.scrollLeft + track.clientWidth >= track.scrollWidth - tolerance);
  };

  track.addEventListener("scroll", updateArrowState);
  window.addEventListener("resize", updateArrowState);
  setTimeout(updateArrowState, 100);

  leftBtn.onclick = () => {
    const card = track.querySelector(".timeline-col");
    if (card) track.scrollBy({ left: -(card.offsetWidth + 14), behavior: "smooth" });
  };

  rightBtn.onclick = () => {
    const card = track.querySelector(".timeline-col");
    if (card) track.scrollBy({ left: card.offsetWidth + 14, behavior: "smooth" });
  };

  let isDown = false, startX, scrollLeft;
  track.addEventListener("mousedown", (e) => {
    isDown = true;
    track.classList.add("dragging");
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener("mouseleave", () => { isDown = false; track.classList.remove("dragging"); });
  track.addEventListener("mouseup", () => { isDown = false; track.classList.remove("dragging"); });
  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    track.scrollLeft = scrollLeft - ((e.pageX - track.offsetLeft) - startX) * 1.5;
    updateArrowState();
  });
}

let rawGalleryData = [];
let currentGalleryFilter = "all";

async function loadGallery() {
  const container = document.getElementById("pinboardGrid");
  if (!container) return;

  try {
    const response = await fetch("gallery.json");
    rawGalleryData = await response.json();
    renderPinboardGallery();
    setupGalleryFilters();
  } catch (error) {
    console.error("Error loading gallery JSON:", error);
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 0.8rem; padding: 10px;">Failed to load gallery items.</p>';
  }
}

function renderPinboardGallery() {
  const container = document.getElementById("pinboardGrid");
  if (!container) return;

  const filtered = rawGalleryData.filter((item) => {
    if (currentGalleryFilter === "all") return true;
    return item.category == currentGalleryFilter;
  });

  const rotations = [-3, 2, -2.5, 3, -1.5, 2.5, -3.5, 1.8];

  container.innerHTML = filtered
    .map((item, index) => {
      const rot = rotations[index % rotations.length];
      const formattedCategory = item.category 
        ? item.category.charAt(0).toUpperCase() + item.category.slice(1) 
        : "Memory";

      return `
      <article class="polaroid-card" style="--rot: ${rot}deg;" onclick="openGalleryModal('${item.image}')">
        <div class="card-img-box">
          <img src="${item.image || "https://via.placeholder.com/600x338"}" alt="${item.title}" loading="lazy">
        </div>
        <div class="card-meta">
          <span class="card-badge">${formattedCategory}</span>
          <span class="card-date">${item.date}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-caption">${item.quote || ""}</p>
      </article>
    `;
    })
    .join("");
}

function setupGalleryFilters() {
  const filterBtns = document.querySelectorAll(".pinboard-section .filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentGalleryFilter = btn.dataset.filter;
      renderPinboardGallery();
    });
  });
}

function openGalleryModal(imgSrc) {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  if (modal && modalImg && imgSrc) {
    modalImg.src = imgSrc;
    modal.classList.add("active");
  }
}

function toggleExpand(cardId) {
  const card = document.getElementById(cardId);
  if (card) card.classList.toggle("expanded");
}

let currentPlayingId = null;

function toggleAudio(trackId) {
  const audioElement = document.getElementById(`audio-${trackId}`);
  const playBtn = document.querySelector(`#track-${trackId} .play-btn`);
  const progressBar = document.getElementById(`progress-${trackId}`);

  if (!audioElement) return;

  if (currentPlayingId && currentPlayingId !== trackId) {
    const prevAudio = document.getElementById(`audio-${currentPlayingId}`);
    const prevBtn = document.querySelector(`#track-${currentPlayingId} .play-btn`);
    const prevProgress = document.getElementById(`progress-${currentPlayingId}`);

    if (prevAudio) { prevAudio.pause(); prevAudio.currentTime = 0; }
    if (prevBtn) prevBtn.textContent = "▶";
    if (prevProgress) prevProgress.style.width = "0%";
  }

  if (!audioElement.dataset.listenersAttached) {
    audioElement.addEventListener("timeupdate", () => {
      if (progressBar && audioElement.duration) {
        progressBar.style.width = `${(audioElement.currentTime / audioElement.duration) * 100}%`;
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

function setupFloatingWidget() {
  const ball = document.getElementById("floating-ball");
  const menu = document.getElementById("floating-menu");

  if (!ball || !menu) return;

  ball.addEventListener("dragstart", (e) => e.preventDefault());
  ball.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("hidden"); });

  document.addEventListener("click", (e) => {
    const widget = document.getElementById("floating-widget");
    if (widget && !widget.contains(e.target)) menu.classList.add("hidden");
  });

  document.querySelectorAll(".floating-menu a").forEach((link) => {
    link.addEventListener("click", () => menu.classList.add("hidden"));
  });
}

function setupLoadingScreen() {
  const loadingScreen = document.getElementById("app-loading-screen");
  if (!loadingScreen) return;
  setTimeout(() => loadingScreen.classList.add("fade-out"), 2200);
}

let deferredPrompt = null;

function setupPWA() {
  const pwaInstallNavBtn = document.getElementById("pwa-install-nav-btn");
  const pwaModal = document.getElementById("pwa-modal");
  const pwaModalClose = document.getElementById("pwa-modal-close");
  const pwaInstallBtn = document.getElementById("pwa-install-btn");
  const pwaNativeBox = document.getElementById("pwa-native-box");
  const pwaIosInstructions = document.getElementById("pwa-ios-instructions");

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (isStandalone && pwaInstallNavBtn) pwaInstallNavBtn.style.display = "none";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((err) => console.error("Service Worker failed:", err));
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener("appinstalled", () => {
    if (pwaInstallNavBtn) pwaInstallNavBtn.style.display = "none";
    if (pwaModal) pwaModal.classList.remove("active");
    deferredPrompt = null;
  });

  if (pwaInstallNavBtn) {
    pwaInstallNavBtn.addEventListener("click", () => {
      const menu = document.getElementById("floating-menu");
      if (menu) menu.classList.add("hidden");
      if (pwaModal) pwaModal.classList.add("active");

      if (pwaNativeBox) pwaNativeBox.style.display = deferredPrompt || !isIOS ? "block" : "none";
      if (pwaIosInstructions) pwaIosInstructions.style.display = !deferredPrompt && isIOS ? "block" : "none";
    });
  }

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted" && pwaInstallNavBtn) pwaInstallNavBtn.style.display = "none";
        deferredPrompt = null;
        if (pwaModal) pwaModal.classList.remove("active");
      } else {
        alert(' Browser ထဲရှိ "Add to Home Screen" ကို အသုံးပြုပေးပါ။');
      }
    });
  }

  if (pwaModalClose) pwaModalClose.addEventListener("click", () => pwaModal.classList.remove("active"));
  if (pwaModal) pwaModal.addEventListener("click", (e) => { if (e.target === pwaModal) pwaModal.classList.remove("active"); });
}

function handleCategoryArrow(container, items) {
  const card = container.closest(".fav-card");
  const arrowBtn = card ? card.querySelector(".arrow-btn") : null;
  if (arrowBtn) {
    arrowBtn.style.display = items && items.length > 3 ? "flex" : "none";
  }
}

async function loadFavorites() {
  try {
    const response = await fetch("favorites.json");
    const data = await response.json();

    renderMediaCategory("fav-movies-list", data.movies);
    renderMediaCategory("fav-series-list", data.series);

    const charContainer = document.getElementById("fav-characters-list");
    if (charContainer && data.characters) {
      handleCategoryArrow(charContainer, data.characters);
      const visible = data.characters.slice(0, 3);
      const hidden = data.characters.slice(3);
      let html = visible.map((c) => createCharHTML(c)).join("");
      if (hidden.length > 0) {
        html += `<div class="expandable-content">${hidden.map((c) => createCharHTML(c)).join("")}</div>`;
      }
      charContainer.innerHTML = html;
    }

    const playlistContainer = document.getElementById("fav-playlist-list");
    if (playlistContainer && data.playlist) {
      handleCategoryArrow(playlistContainer, data.playlist);
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

  handleCategoryArrow(container, items);
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
      <img src="${item.cover}" alt="${item.title}" class="item-cover" loading="lazy" />
      <div class="media-info">
        <span class="title">${item.title}</span>
        <span class="year">(${item.year})</span>
        <span class="studio">${item.studio}</span>
      </div>
       ${item.trailer ? `<a href="${item.trailer}" target="_blank" class="trailer-link" >Watch Trailer</a>` : ""}
    </div>
  `;
}

function createCharHTML(item) {
  return `
    <div class="char-info">
      <img src="${item.avatar}" alt="${item.name}" class="avatar-img" loading="lazy" />
      <div class="media-info">
      <span class="char-name">${item.name}</span>
      <span class="char-movie">${item.movie}</span>
      </div>     
    </div>
  `;
}

function createTrackHTML(item) {
  return `
    <div class="playlist-item" id="track-${item.id}">
      <img src="${item.cover}" alt="${item.title}" class="album-art" loading="lazy" />
      <div class="track-info">
        <span class="song-title">${item.title}</span>
        <span class="artist-name">${item.artist}</span>
        <div class="progress-bar-container">
          <div class="progress-bar" id="progress-${item.id}"></div>
        </div>
      </div>
      <button class="play-btn" onclick="toggleAudio(${item.id})">▶</button>
      <audio id="audio-${item.id}" src="${item.src}"></audio>
    </div>
  `;
}

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