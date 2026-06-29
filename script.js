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
  const centerY = height * (width < 620 ? 0.51 : 0.53);
  const scale = Math.min(width * 0.0225, height * 0.028, 19);
  const particleCount = Math.min(1550, Math.max(820, Math.floor((width * height) / 720)));
  const outlineCount = Math.floor(particleCount * 0.34);

  loveParticles = Array.from({ length: particleCount }, (_, index) => {
    const isOutline = index < outlineCount;
    const t = randomBetween(0, Math.PI * 2);
    const point = getHeartPoint(t);
    const fill = isOutline
      ? randomBetween(0.92, 1.05)
      : Math.sqrt(Math.random()) * randomBetween(0.18, 0.94);
    const targetX = centerX + point.x * scale * fill + randomBetween(-1.2, 1.2);
    const targetY = centerY + point.y * scale * fill + randomBetween(-1.2, 1.2);
    const fromSide = Math.random() > 0.5 ? -1 : 1;

    return {
      x: centerX + fromSide * randomBetween(width * 0.35, width * 0.75),
      y: height + randomBetween(30, height * 0.38),
      tx: targetX,
      ty: targetY,
      size: isOutline ? randomBetween(1.35, 2.45) : randomBetween(0.8, 2.05),
      alpha: isOutline ? randomBetween(0.78, 1) : randomBetween(0.35, 0.86),
      delay: randomBetween(0, 0.44),
      twinkle: randomBetween(0, Math.PI * 2),
      drift: randomBetween(0.5, 1.8),
      colorShift: Math.random(),
    };
  });
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function drawLoveBase(centerX, centerY, time, beat) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(beat, beat);

  const baseGlow = ctx.createRadialGradient(0, 0, 12, 0, 0, 150);
  baseGlow.addColorStop(0, "rgba(180, 245, 255, 0.85)");
  baseGlow.addColorStop(0.24, "rgba(36, 200, 255, 0.46)");
  baseGlow.addColorStop(1, "rgba(0, 95, 255, 0)");

  ctx.fillStyle = baseGlow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 160, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(
      0,
      Math.sin(time * 2.2 + i) * 2,
      112 + i * 18,
      13 + i * 3,
      time * 0.55 + i * 0.7,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = `rgba(117, 225, 255, ${0.56 - i * 0.1})`;
    ctx.lineWidth = 2.4 - i * 0.26;
    ctx.shadowColor = "rgba(74, 211, 255, 0.9)";
    ctx.shadowBlur = 16;
    ctx.stroke();
  }

  ctx.restore();
}

function drawLoveHeart() {
  const elapsed = (performance.now() - loveStart) / 1000;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height * (width < 620 ? 0.51 : 0.53);
  const baseY = Math.min(height - 142, centerY + Math.min(width * 0.24, 218));
  const formed = Math.min(1, elapsed / 2.6);
  const heartBeat = formed >= 0.98 ? 1 + Math.sin(elapsed * 6.8) * 0.035 : 1;

  drawLoveBase(centerX, baseY, elapsed, 1 + Math.sin(elapsed * 4) * 0.015);

  loveParticles.forEach((particle) => {
    const progress = easeOutCubic(Math.min(1, Math.max(0, (formed - particle.delay) / (1 - particle.delay))));
    const pulse = formed >= 0.98 ? heartBeat : 1;
    const targetX = centerX + (particle.tx - centerX) * pulse;
    const targetY = centerY + (particle.ty - centerY) * pulse;
    const x = particle.x + (targetX - particle.x) * progress;
    const y = particle.y + (targetY - particle.y) * progress;
    const shimmer = 0.72 + Math.sin(elapsed * 5 + particle.twinkle) * 0.28;
    const floatX = formed >= 0.98 ? Math.sin(elapsed * particle.drift + particle.twinkle) * 1.2 : 0;
    const floatY = formed >= 0.98 ? Math.cos(elapsed * particle.drift + particle.twinkle) * 1.1 : 0;

    ctx.beginPath();
    ctx.arc(x + floatX, y + floatY, particle.size * (0.85 + progress * 0.45), 0, Math.PI * 2);
    ctx.fillStyle =
      particle.colorShift > 0.72
        ? `rgba(236, 251, 255, ${particle.alpha * shimmer})`
        : `rgba(77, 202, 255, ${particle.alpha * shimmer})`;
    ctx.shadowColor = particle.colorShift > 0.72
      ? "rgba(235, 252, 255, 0.95)"
      : "rgba(48, 189, 255, 0.95)";
    ctx.shadowBlur = 16;
    ctx.fill();
  });
}

function animate() {
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
  const rect = yesBtn.getBoundingClientRect();
  loveMode = true;
  loveStart = performance.now();
  document.body.classList.add("is-accepted");
  createLoveHeart();
  spawnHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 42);
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
