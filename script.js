/* =========================================================
   CONFIG — personalize the page here
========================================================= */
const CONFIG = {
  name: "ya helwe",        // Replace with the birthday person's name
  birthdayMonth: 6,       // 1-12 — month of their birthday (for the countdown)
  birthdayDay: 14,        // 1-31 — day of their birthday (for the countdown)
};

/* =========================================================
   PERSONALIZE NAME
========================================================= */
document.querySelectorAll("[data-name]").forEach((el) => {
  el.textContent = CONFIG.name;
});

/* =========================================================
   SCROLL REVEAL (Intersection Observer)
========================================================= */
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* =========================================================
   AMBIENT FLOATING HEARTS & SPARKLES
========================================================= */
const floatingContainer = document.getElementById("floatingDecorations");
const floatingEmojis = ["💖", "✨", "🎈", "💛", "🎉", "💜"];

function spawnFloatingItem() {
  const item = document.createElement("span");
  item.className = "float-item";
  item.textContent =
    floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];

  const left = Math.random() * 100;
  const duration = 8 + Math.random() * 10;
  const drift = (Math.random() - 0.5) * 160;
  const size = 1 + Math.random() * 1.4;

  item.style.left = `${left}vw`;
  item.style.fontSize = `${size}rem`;
  item.style.animationDuration = `${duration}s`;
  item.style.setProperty("--drift", `${drift}px`);

  floatingContainer.appendChild(item);

  setTimeout(() => item.remove(), duration * 1000 + 500);
}

setInterval(spawnFloatingItem, 1200);
// Seed a few right away
for (let i = 0; i < 5; i++) {
  setTimeout(spawnFloatingItem, i * 300);
}

/* =========================================================
   CONFETTI ENGINE (canvas based)
========================================================= */
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const CONFETTI_COLORS = [
  "#ff6b9d",
  "#ffd166",
  "#06d6a0",
  "#6f86ff",
  "#a855f7",
  "#ff9a6b",
];

let confettiPieces = [];
let confettiAnimating = false;

class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 6 + Math.random() * 8;
    this.color =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.shape = Math.random() > 0.5 ? "rect" : "circle";

    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 6;

    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 12;
    this.gravity = 0.25;
    this.drag = 0.995;
    this.opacity = 1;
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    if (this.y > canvas.height * 0.85) {
      this.opacity -= 0.02;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(this.opacity, 0);
    ctx.fillStyle = this.color;

    if (this.shape === "rect") {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  isAlive() {
    return this.opacity > 0 && this.y < canvas.height + 50;
  }
}

function launchConfetti(originX, originY, count = 140) {
  for (let i = 0; i < count; i++) {
    confettiPieces.push(new ConfettiPiece(originX, originY));
  }
  if (!confettiAnimating) {
    confettiAnimating = true;
    requestAnimationFrame(animateConfetti);
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiPieces.forEach((piece) => {
    piece.update();
    piece.draw();
  });

  confettiPieces = confettiPieces.filter((piece) => piece.isAlive());

  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* Helper: launch confetti from a burst point near the top of the screen,
   plus a couple of side cannons for a fuller effect */
function celebrateBurst() {
  launchConfetti(canvas.width / 2, canvas.height * 0.25, 160);
  setTimeout(() => launchConfetti(canvas.width * 0.15, canvas.height * 0.5, 90), 150);
  setTimeout(() => launchConfetti(canvas.width * 0.85, canvas.height * 0.5, 90), 250);
}

/* =========================================================
   CELEBRATE BUTTON
========================================================= */
const celebrateBtn = document.getElementById("celebrateBtn");

celebrateBtn.addEventListener("click", () => {
  celebrateBurst();
});

/* =========================================================
   COUNTDOWN TO NEXT BIRTHDAY
========================================================= */
const daysEl = document.getElementById("cd-days");
const hoursEl = document.getElementById("cd-hours");
const minutesEl = document.getElementById("cd-minutes");
const secondsEl = document.getElementById("cd-seconds");
const countdownGrid = document.getElementById("countdown");
const countdownCaption = document.getElementById("countdownCaption");
const todayBanner = document.getElementById("todayBanner");

function getNextBirthday() {
  const now = new Date();
  let next = new Date(
    now.getFullYear(),
    CONFIG.birthdayMonth - 1,
    CONFIG.birthdayDay,
    0, 0, 0
  );

  // If this year's birthday has already passed, target next year
  if (next < now && !isSameDay(next, now)) {
    next = new Date(
      now.getFullYear() + 1,
      CONFIG.birthdayMonth - 1,
      CONFIG.birthdayDay,
      0, 0, 0
    );
  }
  return next;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function pad(num) {
  return String(num).padStart(2, "0");
}

let hasCelebratedToday = false;

function updateCountdown() {
  const now = new Date();
  const isBirthdayToday =
    now.getMonth() + 1 === CONFIG.birthdayMonth &&
    now.getDate() === CONFIG.birthdayDay;

  if (isBirthdayToday) {
    countdownGrid.style.display = "none";
    countdownCaption.style.display = "none";
    todayBanner.removeAttribute("hidden");

    if (!hasCelebratedToday) {
      hasCelebratedToday = true;
      celebrateBurst();
    }
    return;
  }

  const target = getNextBirthday();
  const diff = target - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = pad(days);
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* =========================================================
   SCROLL TO TOP BUTTON
========================================================= */
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    scrollTopBtn.removeAttribute("hidden");
  } else {
    scrollTopBtn.setAttribute("hidden", "");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================================================
   LITTLE EXTRA: gentle confetti welcome on first load
========================================================= */
window.addEventListener("load", () => {
  setTimeout(() => {
    launchConfetti(window.innerWidth / 2, window.innerHeight * 0.2, 100);
  }, 600);
});
