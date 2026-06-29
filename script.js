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

let stars = [];
let hearts = [];
let loveParticles = [];
let lineIndex = 0;
let noClickCount = 0;
let loveMode = false;
let loveStart = 0;

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

function createLoveHeart() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height * 0.52;
  const scale = Math.min(width * 0.028, height * 0.036, 26);
  const particleCount = Math.min(5600, Math.max(2800, Math.floor((width * height) / 165)));
  const outlineCount = Math.floor(particleCount * 0.58);

  loveParticles = Array.from({ length: particleCount }, (_, index) => {
    const isOutline = index < outlineCount;
    const t = randomBetween(0, Math.PI * 2);
    const point = getHeartPoint(t);
    const fill = isOutline ? randomBetween(0.96, 1.08) : Math.sqrt(Math.random()) * randomBetween(0.12, 0.92);
    const halo = Math.random() > 0.9;

    return {
      sx: centerX + randomBetween(-width * 0.06, width * 0.06),
      sy: centerY + randomBetween(-height * 0.06, height * 0.06),
      mx:
        point.x * scale * fill +
        randomBetween(-1.4, 1.4) +
        (!isOutline && Math.abs(point.x) < 2.4 ? randomBetween(-28, 28) : 0),
      my: point.y * scale * fill + randomBetween(-1.4, 1.4),
      size: isOutline ? randomBetween(1.05, 2.05) : randomBetween(0.62, 1.48),
      alpha: isOutline ? randomBetween(0.72, 0.98) : randomBetween(0.18, 0.56),
      delay: isOutline ? randomBetween(0, 0.35) : randomBetween(0.12, 0.72),
      twinkle: randomBetween(0, Math.PI * 2),
      drift: randomBetween(0.6, 2.2),
      halo,
      isOutline,
      colorShift: Math.random(),
    };
  });
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function drawLoveHeart() {
  const elapsed = (performance.now() - loveStart) / 1000;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height * 0.52;
  const intro = easeOutCubic(clamp01(elapsed / 1.45));
  const heartbeat =
    1 +
    Math.sin(elapsed * 4.4) * 0.038 * intro +
    Math.sin(elapsed * 8.8) * 0.012 * intro;
  const breath = 0.28 + intro * 0.72;
  const glow = ctx.createRadialGradient(centerX, centerY, 18, centerX, centerY, Math.min(width, height) * 0.38);

  glow.addColorStop(0, `rgba(255, 84, 134, ${0.14 * intro})`);
  glow.addColorStop(0.36, `rgba(255, 37, 106, ${0.08 * intro})`);
  glow.addColorStop(1, "rgba(255, 37, 106, 0)");

  ctx.save();
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, Math.min(width, height) * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  loveParticles.forEach((particle) => {
    const appear = easeOutCubic(clamp01((elapsed - particle.delay) / 1.35));
    const pulse = breath * heartbeat;
    const driftX = Math.sin(elapsed * particle.drift + particle.twinkle) * intro * (particle.isOutline ? 1.4 : 2.2);
    const driftY = Math.cos(elapsed * particle.drift + particle.twinkle) * intro * (particle.isOutline ? 1.2 : 1.8);
    const targetX = centerX + particle.mx * pulse + driftX;
    const targetY = centerY + particle.my * pulse + driftY;
    const x = particle.sx + (targetX - particle.sx) * appear;
    const y = particle.sy + (targetY - particle.sy) * appear;
    const shimmer = 0.68 + Math.sin(elapsed * 6.2 + particle.twinkle) * 0.32;
    const alpha = particle.alpha * appear * shimmer;
    const radius = particle.size * (0.78 + appear * 0.55 + (particle.halo ? 0.7 : 0));

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle =
      particle.colorShift > 0.78
        ? `rgba(255, 232, 239, ${alpha})`
        : `rgba(255, ${particle.isOutline ? 58 : 94}, ${particle.isOutline ? 114 : 142}, ${alpha})`;
    ctx.shadowColor = particle.colorShift > 0.78
      ? "rgba(255, 235, 242, 0.95)"
      : "rgba(255, 44, 112, 0.92)";
    ctx.shadowBlur = particle.isOutline ? 14 : 9;
    ctx.fill();
  });
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  if (!loveMode) {
    stars.forEach((star) => {
      const alpha = star.alpha + Math.sin(Date.now() * 0.0015 + star.pulse) * 0.18;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, alpha)})`;
      ctx.fill();
    });
  }

  hearts = hearts.filter((heart) => heart.life > 0);
  hearts.forEach((heart) => {
    heart.x += heart.vx;
    heart.y += heart.vy;
    heart.vy += 0.035;
    heart.rotation += heart.spin;
    heart.life -= 0.012;
    drawHeart(heart.x, heart.y, heart.size, heart.alpha * heart.life, heart.rotation);
  });

  if (loveMode) {
    drawLoveHeart();
  }

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
  if (loveMode) return;
  if (event.target.closest("button")) return;
  spawnHearts(event.clientX, event.clientY, 8);
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("resize", () => {
  if (loveMode) {
    createLoveHeart();
  }
});

resizeCanvas();
animate();
window.setInterval(cycleLines, 3000);
