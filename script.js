document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const introOverlay = document.getElementById('intro-overlay');
  const roseSvg = document.querySelector('.rose-svg');
  const mainContent = document.getElementById('main-content');
  const bgMusic = document.getElementById('bg-music');
  const btnPlay = document.getElementById('btn-play');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const btnMute = document.getElementById('btn-mute');
  const iconVolume = document.getElementById('icon-volume');
  const iconMuted = document.getElementById('icon-muted');
  const volumeSlider = document.getElementById('volume-slider');
  const equalizer = document.getElementById('equalizer');
  const petalContainer = document.getElementById('petal-container');
  const ambientCanvas = document.getElementById('ambient-canvas');

  let isAudioPlaying = false;
  let audioUnlocked = false;

  /* -------------------------------------------------------------
     1. Ambient Particles Background
  ------------------------------------------------------------- */
  function initAmbientParticles() {
    const ctx = ambientCanvas.getContext('2d');
    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      speedY: -(Math.random() * 0.3 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2
    }));

    function render() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 114, 182, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(render);
    }
    render();
  }

  /* -------------------------------------------------------------
     2. Opening Animation Timeline
  ------------------------------------------------------------- */
  function runIntroSequence() {
    // Step 1: Open flower bud smoothly after 1.2s delay
    setTimeout(() => {
      roseSvg.classList.add('bloomed');
    }, 1200);

    // Step 2: Hold bloom, then fade overlay out
    setTimeout(() => {
      introOverlay.classList.add('fade-out');
      
      // Reveal main romantic content
      mainContent.classList.remove('hidden');
      setTimeout(() => {
        mainContent.classList.add('visible');
        mainContent.removeAttribute('aria-hidden');
      }, 50);

      // Start falling petals stream
      startFallingPetals();
    }, 5200);

    // Remove overlay element completely after transition
    setTimeout(() => {
      introOverlay.remove();
    }, 6800);
  }

  /* -------------------------------------------------------------
     3. Falling Rose Petals Engine
  ------------------------------------------------------------- */
  function startFallingPetals() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const maxPetals = 25;
    let activePetals = 0;

    function createPetal() {
      if (activePetals >= maxPetals) return;

      const petal = document.createElement('div');
      petal.className = 'falling-petal';

      const size = Math.random() * 12 + 10; // 10px to 22px
      const startX = Math.random() * window.innerWidth;
      const duration = Math.random() * 5 + 6; // 6s to 11s fall duration
      const horizontalDrift = (Math.random() - 0.5) * 150;
      const rotation = Math.random() * 360;

      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.3}px`;
      petal.style.left = `${startX}px`;

      petalContainer.appendChild(petal);
      activePetals++;

      const startTime = performance.now();

      function animate(currentTime) {
        const elapsed = (currentTime - startTime) / 1000;
        const progress = elapsed / duration;

        if (progress < 1) {
          const currentY = progress * (window.innerHeight + 60);
          const currentX = startX + Math.sin(progress * Math.PI * 2) * horizontalDrift;
          const currentRotate = rotation + progress * 360;

          petal.style.transform = `translate3d(${currentX - startX}px, ${currentY}px, 0) rotate(${currentRotate}deg)`;
          requestAnimationFrame(animate);
        } else {
          petal.remove();
          activePetals--;
        }
      }

      requestAnimationFrame(animate);
    }

    // Continuous spawn loop
    setInterval(createPetal, 450);
  }

  /* -------------------------------------------------------------
     4. Audio & Music Player Management
  ------------------------------------------------------------- */
  function updateAudioUI() {
    if (isAudioPlaying) {
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
      equalizer.classList.add('playing');
    } else {
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
      equalizer.classList.remove('playing');
    }
  }

  function togglePlay() {
    if (!audioUnlocked) unlockAudio();

    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        isAudioPlaying = true;
        updateAudioUI();
      }).catch(err => console.log('Audio playback blocked or failed:', err));
    } else {
      bgMusic.pause();
      isAudioPlaying = false;
      updateAudioUI();
    }
  }

  function unlockAudio() {
    audioUnlocked = true;
    bgMusic.volume = parseFloat(volumeSlider.value);
  }

  // Global user interaction listener to bypass browser autoplay restrictions
  function handleFirstUserInteraction() {
    if (!audioUnlocked) {
      unlockAudio();
      bgMusic.play().then(() => {
        isAudioPlaying = true;
        updateAudioUI();
      }).catch(() => {
        // Autoplay silent handle if user hasn't toggled manually
      });
    }
    window.removeEventListener('click', handleFirstUserInteraction);
    window.removeEventListener('touchstart', handleFirstUserInteraction);
  }

  window.addEventListener('click', handleFirstUserInteraction);
  window.addEventListener('touchstart', handleFirstUserInteraction);

  btnPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bgMusic.volume = val;
    bgMusic.muted = val === 0;

    if (val === 0) {
      iconVolume.classList.add('hidden');
      iconMuted.classList.remove('hidden');
    } else {
      iconVolume.classList.remove('hidden');
      iconMuted.classList.add('hidden');
    }
  });

  btnMute.addEventListener('click', (e) => {
    e.stopPropagation();
    bgMusic.muted = !bgMusic.muted;
    if (bgMusic.muted) {
      iconVolume.classList.add('hidden');
      iconMuted.classList.remove('hidden');
    } else {
      iconVolume.classList.remove('hidden');
      iconMuted.classList.add('hidden');
    }
  });

  /* -------------------------------------------------------------
     5. Initialization
  ------------------------------------------------------------- */
  initAmbientParticles();
  runIntroSequence();
});