/**
 * THE ORACLE — Interactive Experience Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const btnTerminal = document.getElementById('btnTerminal');
  const subjectWrapper = document.getElementById('subjectWrapper');
  const navItems = document.querySelectorAll('.nav-item');

  // =========================================================================
  // Web Audio Synthesizer (Chirp & Impact SFX)
  // =========================================================================
  let audioCtx = null;

  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    } catch (e) {}
  }

  function playTone(freq = 880, duration = 0.08, type = 'sine') {
    initAudio();
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime + 0.02; // Small buffer to ensure timing
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  // Hover targets
  const hoverables = [
    btnTerminal,
    subjectWrapper,
    ...navItems
  ];

  // Restored Audio Feedback for Navigation
  if (btnTerminal) {
    btnTerminal.addEventListener('mousedown', () => {
      playTone(980, 0.09, 'sine');
    });
  }

  navItems.forEach(item => {
    item.addEventListener('mousedown', () => {
      playTone(980, 0.09, 'sine');
      
      // Auto-reset the white pill so it doesn't get stuck on the home screen
      setTimeout(() => {
        window.dispatchEvent(new Event('resetGooeyNav'));
      }, 600);
    });
  });

  // Subject click audio feedback
  if (subjectWrapper) {
    subjectWrapper.addEventListener('mousedown', () => {
      playTone(1320, 0.12, 'triangle');
    });
  }

  // Submit button audio feedback
  const submitBtns = document.querySelectorAll('.btn-power-smash');
  submitBtns.forEach(btn => {
    btn.addEventListener('mousedown', () => {
      playTone(523.25, 0.15, 'sine'); // Soft, pleasant chime
    });
  });

  // =========================================================================
  // Click Spark Effect (Ported from React Bits)
  // =========================================================================
  const sparkCanvas = document.getElementById('clickSparkCanvas');
  if (sparkCanvas) {
    const ctx = sparkCanvas.getContext('2d');
    let sparks = [];
    let sparkAnimationId = null;

    // Config matching the React component defaults
    const sparkColor = '#ffffff';
    const sparkSize = 12;
    const sparkRadius = 25;
    const sparkCount = 8;
    const duration = 400;
    const extraScale = 1.0;

    function resizeSparkCanvas() {
      sparkCanvas.width = window.innerWidth;
      sparkCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeSparkCanvas);
    resizeSparkCanvas();

    function easeOut(t) {
      return t * (2 - t);
    }

    function drawSparks(timestamp) {
      ctx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
      
      sparks = sparks.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const eased = easeOut(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      if (sparks.length > 0) {
        sparkAnimationId = requestAnimationFrame(drawSparks);
      } else {
        sparkAnimationId = null;
      }
    }

    window.addEventListener('mousedown', (e) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x,
          y,
          angle: (2 * Math.PI * i) / sparkCount,
          startTime: now
        });
      }

      if (!sparkAnimationId) {
        sparkAnimationId = requestAnimationFrame(drawSparks);
      }
    });
  }

  // =========================================================================
  // Gooey Nav (Ported from React Bits)
  // =========================================================================
  function initGooeyNav() {
    const container = document.getElementById('gooeyNav');
    if (!container) return;
    
    const gooeyItems = container.querySelectorAll('li');
    const filterEl = container.querySelector('.effect.filter');
    const textEl = container.querySelector('.effect.text');
    if (!filterEl || !textEl || gooeyItems.length === 0) return;

    let activeIndex = -1; // -1 means no item is active initially
    const animationTime = 600;
    const particleCount = 15;
    const particleDistances = [90, 10];
    const particleR = 100;
    const timeVariance = 300;
    const colors = [1, 2, 3, 1, 2, 3, 1, 4];

    const noise = (n = 1) => n / 2 - Math.random() * n;
    const getXY = (distance, pointIndex, totalPoints) => {
      const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
      return [distance * Math.cos(angle), distance * Math.sin(angle)];
    };

    const createParticle = (i, t, d, r) => {
      let rotate = noise(r / 10);
      return {
        start: getXY(d[0], particleCount - i, particleCount),
        end: getXY(d[1] + noise(7), particleCount - i, particleCount),
        time: t,
        scale: 1 + noise(0.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
      };
    };

    const makeParticles = (element) => {
      const bubbleTime = animationTime * 2 + timeVariance;
      element.style.setProperty('--time', `${bubbleTime}ms`);

      for (let i = 0; i < particleCount; i++) {
        const t = animationTime * 2 + noise(timeVariance * 2);
        const p = createParticle(i, t, particleDistances, particleR);
        element.classList.remove('active');

        setTimeout(() => {
          const particle = document.createElement('span');
          const point = document.createElement('span');
          particle.classList.add('particle');
          particle.style.setProperty('--start-x', `${p.start[0]}px`);
          particle.style.setProperty('--start-y', `${p.start[1]}px`);
          particle.style.setProperty('--end-x', `${p.end[0]}px`);
          particle.style.setProperty('--end-y', `${p.end[1]}px`);
          particle.style.setProperty('--time', `${p.time}ms`);
          particle.style.setProperty('--scale', `${p.scale}`);
          particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
          particle.style.setProperty('--rotate', `${p.rotate}deg`);

          point.classList.add('point');
          particle.appendChild(point);
          element.appendChild(particle);
          
          requestAnimationFrame(() => {
            element.classList.add('active');
          });
          
          setTimeout(() => {
            if (element.contains(particle)) {
              element.removeChild(particle);
            }
          }, t);
        }, 30);
      }
    };

    const updateEffectPosition = (element) => {
      const containerRect = container.getBoundingClientRect();
      const pos = element.getBoundingClientRect();
      const styles = {
        left: `${pos.x - containerRect.x}px`,
        top: `${pos.y - containerRect.y}px`,
        width: `${pos.width}px`,
        height: `${pos.height}px`
      };
      
      Object.assign(filterEl.style, styles);
      Object.assign(textEl.style, styles);
      textEl.innerText = element.innerText;
    };

    gooeyItems.forEach((li, index) => {
      li.addEventListener('mousedown', (e) => {
        if (activeIndex === index) return;

        if (activeIndex >= 0 && gooeyItems[activeIndex]) {
          gooeyItems[activeIndex].classList.remove('active');
        }
        
        activeIndex = index;
        li.classList.add('active');
        updateEffectPosition(li);

        const particles = filterEl.querySelectorAll('.particle');
        particles.forEach(p => p.remove());

        textEl.classList.remove('active');
        void textEl.offsetWidth; 
        textEl.classList.add('active');

        makeParticles(filterEl);
      });
    });

    const activeLi = activeIndex >= 0 ? gooeyItems[activeIndex] : null;
    if (activeLi) {
      activeLi.classList.add('active');
      updateEffectPosition(activeLi);
      textEl.classList.add('active');
    }

    const ro = new ResizeObserver(() => {
      if (activeIndex >= 0 && gooeyItems[activeIndex]) {
        updateEffectPosition(gooeyItems[activeIndex]);
      }
    });
    ro.observe(container);

    window.addEventListener('resetGooeyNav', () => {
      if (activeIndex >= 0 && gooeyItems[activeIndex]) {
        gooeyItems[activeIndex].classList.remove('active');
      }
      activeIndex = -1;
      textEl.classList.remove('active');
      filterEl.classList.remove('active');
      textEl.innerText = '';
    });
  }

  initGooeyNav();

});
