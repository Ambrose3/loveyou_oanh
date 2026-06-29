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
let loveConstellations = [];
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

function createLoveConstellations(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const groupCount = width < 620 ? 7 : 11;
  const minCenterGap = Math.min(width, height) * 0.22;

  return Array.from({ length: groupCount }, () => {
    let anchorX = randomBetween(width * 0.08, width * 0.92);
    let anchorY = randomBetween(height * 0.1, height * 0.9);

    for (let i = 0; i < 16; i += 1) {
      const dx = anchorX - centerX;
      const dy = anchorY - centerY;

      if (Math.hypot(dx, dy) > minCenterGap) break;
      anchorX = randomBetween(width * 0.08, width * 0.92);
      anchorY = randomBetween(height * 0.1, height * 0.9);
    }

    const nodeCount = Math.floor(randomBetween(5, 9));
    const nodes = Array.from({ length: nodeCount }, () => {
      const angle = randomBetween(0, Math.PI * 2);
      const radius = randomBetween(18, Math.min(width, height) * 0.105);

      return {
        x: Math.min(width - 22, Math.max(22, anchorX + Math.cos(angle) * radius)),
        y: Math.min(height - 22, Math.max(22, anchorY + Math.sin(angle) * radius)),
      };
    });

    const links = nodes.slice(1).map((_, index) => [index, index + 1]);

    if (nodes.length > 4) {
      links.push([0, 3], [1, nodes.length - 1]);
    }

    return { nodes, links };
  });
}

function createLoveHeart() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height * (width < 620 ? 0.51 : 0.52);
  const scale = Math.min(width * 0.025, height * 0.031, 23);
  const particleCount = Math.min(4600, Math.max(2200, Math.floor((width * height) / 210)));
  const outlineCount = Math.floor(particleCount * 0.28);

  loveConstellations = createLoveConstellations(width, height);

  loveParticles = Array.from({ length: particleCount }, (_, index) => {
    const isOutline = index < outlineCount;
    const t = randomBetween(0, Math.PI * 2);
    const point = getHeartPoint(t);
    const depth = randomBetween(-1, 1);
    const fill = isOutline
      ? randomBetween(0.93, 1.05)
      : Math.sqrt(Math.random()) * randomBetween(0.12, 0.97);
    const depthScale = 1 + depth * 0.08;
    const targetX = centerX + point.x * scale * fill * depthScale + depth * 8 + randomBetween(-0.9, 0.9);
    const targetY = centerY + point.y * scale * fill * depthScale - depth * 6 + randomBetween(-0.9, 0.9);
    const group = loveConstellations[Math.floor(randomBetween(0, loveConstellations.length))];
    const node = group.nodes[Math.floor(randomBetween(0, group.nodes.length))];

    return {
      x: node.x + randomBetween(-18, 18),
      y: node.y + randomBetween(-18, 18),
      tx: targetX,
      ty: targetY,
      size: isOutline ? randomBetween(1.25, 2.35) : randomBetween(0.72, 1.82),
      alpha: isOutline ? randomBetween(0.78, 1) : randomBetween(0.42, 0.9),
      delay: randomBetween(0, 0.32),
      twinkle: randomBetween(0, Math.PI * 2),
      drift: randomBetween(0.5, 1.8),
      depth,
      colorShift: Math.random(),
    };
  });
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function drawHeartSilhouette(centerX, centerY, scale, beat, formed) {
  if (formed < 0.42) return;

  const alpha = Math.min(0.18, (formed - 0.42) * 0.32);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale * beat, scale * beat);
  ctx.beginPath();

  for (let i = 0; i <= 160; i += 1) {
    const point = getHeartPoint((Math.PI * 2 * i) / 160);

    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.closePath();
  ctx.fillStyle = `rgba(22, 184, 255, ${alpha})`;
  ctx.shadowColor = "rgba(55, 203, 255, 0.72)";
  ctx.shadowBlur = 1.55;
  ctx.fill();
  ctx.restore();
}

function drawConstellationLines(formed, time) {
  if (formed > 0.9) return;

  const alpha = (1 - formed / 0.9) * 0.42;

  loveConstellations.forEach((group) => {
    group.links.forEach(([fromIndex, toIndex]) => {
      const from = group.nodes[fromIndex];
      const to = group.nodes[toIndex];

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = `rgba(123, 222, 255, ${alpha * (0.72 + Math.sin(time * 3) * 0.18)})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(91, 211, 255, 0.72)";
      ctx.shadowBlur = 8;
      ctx.stroke();
    });
  });
}

function drawLoveHeart() {
  const elapsed = (performance.now() - loveStart) / 1000;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height * (width < 620 ? 0.51 : 0.52);
  const heartScale = Math.min(width * 0.025, height * 0.031, 23);
  const formed = Math.min(1, elapsed / 2.45);
  const heartBeat = formed >= 0.98 ? 1 + Math.sin(elapsed * 7.2) * 0.035 : 1;

  drawConstellationLines(formed, elapsed);
  drawHeartSilhouette(centerX, centerY, heartScale, heartBeat, formed);

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
    const depthGlow = 1 + particle.depth * 0.16;

    ctx.beginPath();
    ctx.arc(x + floatX, y + floatY, particle.size * depthGlow * (0.9 + progress * 0.5), 0, Math.PI * 2);
    ctx.fillStyle =
      particle.colorShift > 0.74
        ? `rgba(240, 252, 255, ${particle.alpha * shimmer})`
        : `rgba(57, 198, 255, ${particle.alpha * shimmer})`;
    ctx.shadowColor = particle.colorShift > 0.72
      ? "rgba(235, 252, 255, 0.95)"
      : "rgba(48, 189, 255, 0.95)";
    ctx.shadowBlur = formed > 0.96 ? 18 : 12;
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
