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
let loveStreaks = [];
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
  const centerY = height * (width < 620 ? 0.47 : 0.47);
  const baseY = height * (width < 620 ? 0.82 : 0.8);
  const scale = Math.min(width * 0.019, height * 0.024, 17.8);
  const particleCount = Math.min(3900, Math.max(2100, Math.floor((width * height) / 250)));
  const outlineCount = Math.floor(particleCount * 0.46);
  const baseWidth = Math.min(width * 0.31, 320);

  loveParticles = Array.from({ length: particleCount }, (_, index) => {
    const isOutline = index < outlineCount;
    const t = randomBetween(0, Math.PI * 2);
    const point = getHeartPoint(t);
    const depth = randomBetween(-1.25, 1.25);
    const fill = isOutline
      ? randomBetween(0.93, 1.04)
      : Math.sqrt(Math.random()) * randomBetween(0.16, 0.94);
    const modelX = point.x * scale * fill * (1 + depth * 0.045);
    const modelY = point.y * scale * fill * (1 - depth * 0.025);
    const modelZ = depth * scale * 5.8 * fill;
    const baseAngle = randomBetween(0, Math.PI * 2);
    const baseRadius = Math.sqrt(Math.random()) * baseWidth * 0.54;

    return {
      sx: centerX + randomBetween(-width * 0.24, width * 0.24),
      sy: randomBetween(-height * 0.42, height * 0.08),
      bx: centerX + Math.cos(baseAngle) * baseRadius + randomBetween(-10, 10),
      by: baseY + Math.sin(baseAngle) * baseRadius * 0.18 + randomBetween(-5, 5),
      mx: modelX,
      my: modelY,
      mz: modelZ,
      size: isOutline ? randomBetween(1.35, 2.35) : randomBetween(0.7, 1.62),
      alpha: isOutline ? randomBetween(0.84, 1) : randomBetween(0.32, 0.82),
      delay: randomBetween(0, 0.26),
      twinkle: randomBetween(0, Math.PI * 2),
      drift: randomBetween(0.55, 1.9),
      depth,
      colorShift: Math.random(),
    };
  });

  loveStreaks = Array.from({ length: width < 620 ? 34 : 58 }, () => ({
    x: centerX + randomBetween(-baseWidth * 0.48, baseWidth * 0.48),
    targetX: centerX + randomBetween(-baseWidth * 0.28, baseWidth * 0.28),
    y: baseY + randomBetween(-8, 10),
    height: randomBetween(height * 0.18, height * 0.34),
    bend: randomBetween(-46, 46),
    phase: randomBetween(0, Math.PI * 2),
    alpha: randomBetween(0.22, 0.68),
  }));
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

function projectHeartParticle(particle, centerX, centerY, time, beat) {
  const rotation = Math.sin(time * 0.62) * 0.18;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const x3 = particle.mx * cos - particle.mz * sin;
  const z3 = particle.mx * sin + particle.mz * cos;
  const perspective = 520 / (520 + z3);

  return {
    x: centerX + x3 * perspective * beat,
    y: centerY + particle.my * perspective * beat,
    z: z3,
    scale: perspective,
  };
}

function drawPortalBase(centerX, baseY, time, strength) {
  const width = Math.min(window.innerWidth * 0.31, 320);
  const glow = ctx.createRadialGradient(centerX, baseY, 8, centerX, baseY, width * 0.72);

  glow.addColorStop(0, `rgba(213, 250, 255, ${0.86 * strength})`);
  glow.addColorStop(0.25, `rgba(76, 213, 255, ${0.62 * strength})`);
  glow.addColorStop(0.58, `rgba(0, 128, 255, ${0.24 * strength})`);
  glow.addColorStop(1, "rgba(0, 80, 255, 0)");

  ctx.save();
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(centerX, baseY, width * 0.56, width * 0.105, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 5; i += 1) {
    const pulse = Math.sin(time * 2.8 + i * 1.7) * 0.08;

    ctx.beginPath();
    ctx.ellipse(
      centerX,
      baseY + Math.sin(time * 2 + i) * 2,
      width * (0.4 + i * 0.045 + pulse),
      width * (0.052 + i * 0.01),
      time * 0.52 + i * 0.58,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = `rgba(118, 229, 255, ${(0.72 - i * 0.1) * strength})`;
    ctx.lineWidth = 2.3 - i * 0.18;
    ctx.shadowColor = "rgba(76, 213, 255, 0.95)";
    ctx.shadowBlur = 16;
    ctx.stroke();
  }

  ctx.restore();
}

function drawEnergyStreaks(baseY, time, amount) {
  if (amount <= 0) return;

  loveStreaks.forEach((streak) => {
    const shimmer = 0.72 + Math.sin(time * 5.2 + streak.phase) * 0.28;
    const topY = streak.y - streak.height * amount;

    ctx.beginPath();
    ctx.moveTo(streak.x, streak.y);
    ctx.quadraticCurveTo(streak.x + streak.bend, streak.y - streak.height * 0.45, streak.targetX, topY);
    ctx.strokeStyle = `rgba(122, 229, 255, ${streak.alpha * amount * shimmer})`;
    ctx.lineWidth = 1.1 + shimmer * 0.8;
    ctx.shadowColor = "rgba(91, 219, 255, 0.95)";
    ctx.shadowBlur = 12;
    ctx.stroke();
  });
}

function drawLoveHeart() {
  const elapsed = (performance.now() - loveStart) / 1000;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height * (width < 620 ? 0.47 : 0.47);
  const baseY = height * (width < 620 ? 0.82 : 0.8);
  const fallProgress = easeInOutCubic(clamp01(elapsed / 1.45));
  const riseProgress = easeOutCubic(clamp01((elapsed - 1.05) / 2.35));
  const formed = clamp01((elapsed - 3.1) / 0.8);
  const heartBeat = formed > 0 ? 1 + Math.sin(elapsed * 7.4) * 0.038 * formed : 1;
  const baseStrength = Math.min(1, 0.35 + elapsed * 0.72);

  drawPortalBase(centerX, baseY, elapsed, baseStrength);
  drawEnergyStreaks(baseY, elapsed, clamp01((elapsed - 1.05) / 1.4) * (1 - formed));

  loveParticles.forEach((particle) => {
    const particleRise = easeOutCubic(clamp01((riseProgress - particle.delay) / (1 - particle.delay)));
    const projected = projectHeartParticle(particle, centerX, centerY, elapsed, heartBeat);
    const baseX = particle.sx + (particle.bx - particle.sx) * fallProgress;
    const baseFallY = particle.sy + (particle.by - particle.sy) * fallProgress;
    const x = baseX + (projected.x - baseX) * particleRise;
    const y = baseFallY + (projected.y - baseFallY) * particleRise;
    const shimmer = 0.72 + Math.sin(elapsed * 5 + particle.twinkle) * 0.28;
    const floatX = formed > 0 ? Math.sin(elapsed * particle.drift + particle.twinkle) * formed * 1.5 : 0;
    const floatY = formed > 0 ? Math.cos(elapsed * particle.drift + particle.twinkle) * formed * 1.2 : 0;
    const depthGlow = 1 + particle.depth * 0.12 + projected.scale * 0.18;
    const trailAlpha = (1 - particleRise) * fallProgress * 0.38;

    if (trailAlpha > 0.02) {
      ctx.beginPath();
      ctx.moveTo(x, y - 22);
      ctx.lineTo(x, y + 6);
      ctx.strokeStyle = `rgba(118, 229, 255, ${trailAlpha})`;
      ctx.lineWidth = Math.max(0.6, particle.size * 0.45);
      ctx.shadowColor = "rgba(76, 213, 255, 0.8)";
      ctx.shadowBlur = 8;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(
      x + floatX,
      y + floatY,
      particle.size * depthGlow * (0.78 + particleRise * 0.5),
      0,
      Math.PI * 2
    );
    ctx.fillStyle =
      particle.colorShift > 0.74
        ? `rgba(240, 252, 255, ${particle.alpha * shimmer})`
        : `rgba(57, 198, 255, ${particle.alpha * shimmer})`;
    ctx.shadowColor = particle.colorShift > 0.72
      ? "rgba(235, 252, 255, 0.95)"
      : "rgba(48, 189, 255, 0.95)";
    ctx.shadowBlur = particleRise > 0.85 ? 16 : 10;
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
