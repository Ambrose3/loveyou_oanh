const lines = [
  "Anh không biết nói sao cho thật hay...",
  "Chỉ là từ lúc có em, mọi thứ dịu dàng hơn một chút.",
  "Anh muốn được nghe em kể chuyện mỗi ngày.",
  "Muốn được dỗ em khi em buồn, chọc em cười khi em im lặng.",
  "Và muốn được gọi em là người yêu của anh.",
];

const reconsiderLines = [
  "Nghĩ lại đi mà...",
  "Chọn đồng ý xinh hơn đó.",
  "Anh đang hồi hộp thật sự luôn.",
  "Đừng bỏ anh đứng đây lâu quá nha.",
  "Một lần đồng ý thôi, anh vui cả ngày.",
  "Tim anh đang chờ em bấm đó.",
];

const canvas = document.querySelector("#night-canvas");
const ctx = canvas.getContext("2d");
const fadingLine = document.querySelector("#fading-line");
const yesBtn = document.querySelector("#yes-btn");
const noBtn = document.querySelector("#no-btn");
const finalMessage = document.querySelector("#final-message");
const bgMusic = document.querySelector("#bg-music");
const musicToggle = document.querySelector("#music-toggle");

let stars = [];
let hearts = [];
let loveParticles = [];
let heartSource = null;
let lineIndex = 0;
let noClickCount = 0;
let loveMode = false;
let loveStart = 0;
let musicStarted = false;
let musicUnavailable = false;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createStars();
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createStars() {
  const count = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 7000));

  stars = Array.from({ length: count }, () => ({
    x: randomBetween(0, window.innerWidth),
    y: randomBetween(0, window.innerHeight),
    size: randomBetween(0.6, 2.2),
    alpha: randomBetween(0.18, 0.72),
    pulse: randomBetween(0, Math.PI * 2),
  }));
}

function drawHeart(x, y, size, alpha, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 24, size / 24);
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-16, -4, -8, -18, 0, -8);
  ctx.bezierCurveTo(8, -18, 16, -4, 0, 8);
  ctx.fillStyle = `rgba(255, 111, 174, ${alpha})`;
  ctx.shadowColor = "rgba(255, 63, 141, 0.8)";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.restore();
}

function spawnHearts(x, y, count = 18) {
  for (let i = 0; i < count; i += 1) {
    hearts.push({
      x,
      y,
      vx: randomBetween(-2.2, 2.2),
      vy: randomBetween(-4.5, -1.3),
      size: randomBetween(9, 20),
      alpha: randomBetween(0.54, 0.95),
      spin: randomBetween(-0.04, 0.04),
      rotation: randomBetween(-0.6, 0.6),
      life: 1,
    });
  }
}

function getHeartPoint(t) {
  const sin = Math.sin(t);
  const x = 16 * sin * sin * sin;
  const y = -(
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  );

  return { x, y };
}

function heartPosition(rad) {
  return [
    Math.pow(Math.sin(rad), 3),
    -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad)),
  ];
}

function scaleAndTranslate(position, scaleX, scaleY, deltaX, deltaY) {
  return [deltaX + position[0] * scaleX, deltaY + position[1] * scaleY];
}

function createLoveHeart() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = window.innerWidth < 640;
  const scale = Math.min(width / 900, height / 680);
  const dr = isMobile ? 0.3 : 0.1;
  const traceCount = isMobile ? 20 : 50;
  const pointsOrigin = [];
  const targetPoints = [];

  for (let i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210 * scale, 13 * scale, 0, 0));
  }

  for (let i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150 * scale, 9 * scale, 0, 0));
  }

  for (let i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90 * scale, 5 * scale, 0, 0));
  }

  loveParticles = Array.from({ length: pointsOrigin.length }, (_, index) => {
    const x = Math.random() * width;
    const y = Math.random() * height;

    return {
      vx: 0,
      vy: 0,
      speed: Math.random() + 5,
      q: Math.floor(Math.random() * pointsOrigin.length),
      direction: 2 * (index % 2) - 1,
      force: 0.2 * Math.random() + 0.7,
      fill: `hsla(0, ${Math.floor(40 * Math.random() + 60)}%, ${Math.floor(60 * Math.random() + 20)}%, .34)`,
      trace: Array.from({ length: traceCount }, () => ({ x, y })),
    };
  });

  heartSource = {
    config: {
      timeDelta: 0.01,
      traceK: 0.4,
    },
    height,
    pointsOrigin,
    targetPoints,
    time: 0,
    width,
  };

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawLoveHeart() {
  if (!heartSource) return;

  const { config, height, pointsOrigin, targetPoints, width } = heartSource;
  const n = -Math.cos(heartSource.time);
  const pulseScale = (1 + n) * 0.5;

  for (let i = 0; i < pointsOrigin.length; i += 1) {
    targetPoints[i] = [
      pulseScale * pointsOrigin[i][0] + width / 2,
      pulseScale * pointsOrigin[i][1] + height / 2,
    ];
  }

  heartSource.time += (Math.sin(heartSource.time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;
  ctx.fillStyle = "rgba(0, 0, 0, .1)";
  ctx.fillRect(0, 0, width, height);

  for (let i = loveParticles.length; i--;) {
    const particle = loveParticles[i];
    const target = targetPoints[particle.q];
    const dx = particle.trace[0].x - target[0];
    const dy = particle.trace[0].y - target[1];
    const length = Math.sqrt(dx * dx + dy * dy) || 1;

    if (length < 10) {
      if (Math.random() > 0.95) {
        particle.q = Math.floor(Math.random() * pointsOrigin.length);
      } else {
        if (Math.random() > 0.99) {
          particle.direction *= -1;
        }

        particle.q += particle.direction;
        particle.q %= pointsOrigin.length;

        if (particle.q < 0) {
          particle.q += pointsOrigin.length;
        }
      }
    }

    particle.vx += (-dx / length) * particle.speed;
    particle.vy += (-dy / length) * particle.speed;
    particle.trace[0].x += particle.vx;
    particle.trace[0].y += particle.vy;
    particle.vx *= particle.force;
    particle.vy *= particle.force;

    for (let k = 0; k < particle.trace.length - 1;) {
      const current = particle.trace[k];
      const next = particle.trace[++k];
      next.x -= config.traceK * (next.x - current.x);
      next.y -= config.traceK * (next.y - current.y);
    }

    ctx.fillStyle = particle.fill;

    for (let k = 0; k < particle.trace.length; k += 1) {
      ctx.fillRect(particle.trace[k].x, particle.trace[k].y, 1, 1);
    }
  }
}

function animate() {
  if (loveMode) {
    drawLoveHeart();
    requestAnimationFrame(animate);
    return;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  stars.forEach((star) => {
    const alpha = star.alpha + Math.sin(Date.now() * 0.0015 + star.pulse) * 0.18;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, alpha)})`;
    ctx.fill();
  });

  hearts = hearts.filter((heart) => heart.life > 0);
  hearts.forEach((heart) => {
    heart.x += heart.vx;
    heart.y += heart.vy;
    heart.vy += 0.035;
    heart.rotation += heart.spin;
    heart.life -= 0.012;
    drawHeart(heart.x, heart.y, heart.size, heart.alpha * heart.life, heart.rotation);
  });

  requestAnimationFrame(animate);
}

function cycleLines() {
  fadingLine.classList.add("is-fading");

  window.setTimeout(() => {
    lineIndex = (lineIndex + 1) % lines.length;
    fadingLine.textContent = lines[lineIndex];
    fadingLine.classList.remove("is-fading");
  }, 720);
}

function showFinalMessage(text) {
  finalMessage.textContent = text;
  finalMessage.classList.add("show");
}

function showPlea(text, x, y) {
  const plea = document.createElement("span");
  plea.className = "plea-text";
  plea.textContent = text;
  plea.style.left = `${x}px`;
  plea.style.top = `${y}px`;
  document.body.appendChild(plea);
  window.setTimeout(() => plea.remove(), 2800);
}

function updateMusicButton() {
  if (!musicToggle || !bgMusic) return;

  musicToggle.classList.toggle("is-playing", !bgMusic.paused);
  musicToggle.classList.toggle("is-unavailable", musicUnavailable);
  musicToggle.setAttribute("aria-pressed", String(!bgMusic.paused));
  musicToggle.setAttribute(
    "aria-label",
    bgMusic.paused ? "Bật nhạc nền" : "Tắt nhạc nền"
  );
}

function startMusic() {
  if (!bgMusic || musicUnavailable) return;

  bgMusic.volume = 0.62;
  bgMusic.play()
    .then(() => {
      musicStarted = true;
      updateMusicButton();
    })
    .catch(() => {
      updateMusicButton();
    });
}

function toggleMusic() {
  if (!bgMusic || musicUnavailable) return;

  if (bgMusic.paused) {
    startMusic();
    return;
  }

  bgMusic.pause();
  updateMusicButton();
}

function moveNoButton() {
  const scale = Math.max(0.34, 1 - noClickCount * 0.13);
  const padding = 18;
  const safeTop = Math.max(18, window.innerHeight * 0.12);
  const safeBottom = window.innerHeight - noBtn.offsetHeight * scale - padding;
  const safeRight = window.innerWidth - noBtn.offsetWidth * scale - padding;
  const x = randomBetween(padding, Math.max(padding, safeRight));
  const y = randomBetween(safeTop, Math.max(safeTop, safeBottom));

  noBtn.classList.add("is-moving");
  noBtn.style.setProperty("--btn-scale", scale.toFixed(2));
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.opacity = noClickCount > 6 ? "0.72" : "1";
}

yesBtn.addEventListener("click", () => {
  loveMode = true;
  loveStart = performance.now();
  document.body.classList.add("is-accepted");
  createLoveHeart();
  startMusic();
  showFinalMessage("Vậy từ hôm nay, để anh thương em thật nhiều nhé.");
});

noBtn.addEventListener("click", () => {
  noClickCount += 1;

  const rect = noBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const message = reconsiderLines[(noClickCount - 1) % reconsiderLines.length];

  spawnHearts(x, y, 10);
  showPlea(message, x, y - 18);
  showFinalMessage(noClickCount < 4 ? "Nghĩ lại xíu thôi nha..." : "Nút này càng bấm càng bé đó, quay lại đồng ý đi mà.");
  moveNoButton();
});

document.addEventListener("pointerdown", (event) => {
  if (!musicStarted) {
    startMusic();
  }

  if (loveMode) return;
  if (event.target.closest("button")) return;
  spawnHearts(event.clientX, event.clientY, 8);
});

if (musicToggle) {
  musicToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMusic();
  });
}

if (bgMusic) {
  bgMusic.addEventListener("play", updateMusicButton);
  bgMusic.addEventListener("pause", updateMusicButton);
  bgMusic.addEventListener("error", () => {
    musicUnavailable = true;
    updateMusicButton();
  });
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("resize", () => {
  if (loveMode) {
    createLoveHeart();
  }
});

resizeCanvas();
animate();
window.setInterval(cycleLines, 3000);
