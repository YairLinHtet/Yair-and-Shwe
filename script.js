// Start date: July 10, 2026 (Month index 6 = July)
const startDate = new Date(2026, 6, 10);

function updateCounter() {
  const now = new Date();
  const dateRow = document.getElementById("date-row");
  const timeRow = document.getElementById("time-row");

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

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
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
  card.classList.toggle("expanded");
}

let currentPlayingId = null;

function toggleAudio(trackId, audioUrl) {
  const audioElement = document.getElementById(`audio-${trackId}`);
  const playBtn = document.querySelector(`#track-${trackId} .play-btn`);
  const progressBar = document.getElementById(`progress-${trackId}`);

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

  if (audioElement.paused) {
    audioElement.play();
    playBtn.textContent = "❚❚";
    currentPlayingId = trackId;

    audioElement.ontimeupdate = () => {
      const percentage =
        (audioElement.currentTime / audioElement.duration) * 100;
      progressBar.style.width = `${percentage}%`;
    };

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

/* ================= FLOATING BALL DRAG & MENU LOGIC ================= */
function setupFloatingBall() {
  const widget = document.getElementById('floating-widget');
  const ball = document.getElementById('floating-ball');
  const menu = document.getElementById('floating-menu');

  let isDragging = false;
  let hasMoved = false;
  let startX, startY, initialLeft, initialTop;

  ball.addEventListener('mousedown', startDrag);
  ball.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    isDragging = true;
    hasMoved = false;

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = widget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;
    }

    if (hasMoved) {
      e.preventDefault();

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;

      const padding = 10;
      const maxLeft = window.innerWidth - widget.offsetWidth - padding;
      const maxTop = window.innerHeight - widget.offsetHeight - padding;

      newLeft = Math.max(padding, Math.min(newLeft, maxLeft));
      newTop = Math.max(padding, Math.min(newTop, maxTop));

      widget.style.bottom = 'auto';
      widget.style.right = 'auto';
      widget.style.left = `${newLeft}px`;
      widget.style.top = `${newTop}px`;
    }
  }

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
  }

  ball.addEventListener('click', () => {
    if (!hasMoved) {
      menu.classList.toggle('hidden');
    }
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
}

/* ================= PWA INSTALLATION SYSTEM ================= */
let deferredPrompt = null;

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker Registered successfully.'))
      .catch((err) => console.error('Service Worker Registration failed:', err));
  }

  const pwaModal = document.getElementById('pwa-modal');
  const pwaModalClose = document.getElementById('pwa-modal-close');
  const pwaInstallNavBtn = document.getElementById('pwa-install-nav-btn');
  const pwaInstallBtn = document.getElementById('pwa-install-btn');
  const pwaNativeBox = document.getElementById('pwa-native-box');
  const pwaIosInstructions = document.getElementById('pwa-ios-instructions');

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  pwaInstallNavBtn.addEventListener('click', () => {
    document.getElementById('floating-menu').classList.add('hidden');
    pwaModal.classList.add('active');

    if (deferredPrompt) {
      pwaNativeBox.style.display = 'block';
      pwaIosInstructions.style.display = 'none';
    } else if (isIOS) {
      pwaNativeBox.style.display = 'none';
      pwaIosInstructions.style.display = 'block';
    } else {
      pwaNativeBox.style.display = 'block';
      pwaIosInstructions.style.display = 'none';
    }
  });

  pwaInstallBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User prompt outcome: ${outcome}`);
      deferredPrompt = null;
      pwaModal.classList.remove('active');
    } else {
      alert('Browser မူလ Install Prompt အဆင်မသင့်ပါက Browser Menu ထဲရှိ "Add to Home Screen" ကို အသုံးပြုပေးပါ။');
    }
  });

  pwaModalClose.addEventListener('click', () => {
    pwaModal.classList.remove('active');
  });

  pwaModal.addEventListener('click', (e) => {
    if (e.target === pwaModal) {
      pwaModal.classList.remove('active');
    }
  });
}

// Run initializations
updateCounter();
setInterval(updateCounter, 1000);
loadMemories();
loadGallery();
setupFloatingBall();
setupPWA();