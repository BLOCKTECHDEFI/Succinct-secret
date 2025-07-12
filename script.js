import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBO44TRlbJsMMGBJIwepPDxaGp2hAw22QY",
  authDomain: "succinct-secrets.firebaseapp.com",
  projectId: "succinct-secrets",
  storageBucket: "succinct-secrets.appspot.com", // ✅ You had `.firebasestorage.app` — that's WRONG
  messagingSenderId: "483170664867",
  appId: "1:483170664867:web:df39815bd90942c9dc9a16",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const secretsRef = collection(db, "secrets");

// ✅ Submit new secret
const form = document.getElementById("secretForm");
const board = document.getElementById("boardContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value.trim();
  if (!text) return;

  console.log("✅ Submitting secret:", text); // 🔍 Debug log

  try {
    await addDoc(secretsRef, {
      text,
      created: Date.now(),
    });
    textarea.value = "";
    console.log("✅ Secret submitted to Firestore");
  } catch (err) {
    console.error("❌ Failed to submit secret:", err);
  }
});

// ✅ Live sync messages across all users
onSnapshot(secretsRef, (snapshot) => {
  board.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    addMessage(data.text);
  });
});

// ✅ Floating draggable secret cards
function addMessage(text) {
  const div = document.createElement("div");
  div.className = "message";
  div.textContent = text;
  randomizePosition(div);
  board.appendChild(div);
  makeDraggable(div);
}

function randomizePosition(el) {
  const board = document.getElementById("boardContainer");
  const boardRect = board.getBoundingClientRect();

  const margin = 20; // distance from the edges
  const maxLeft = boardRect.width - el.offsetWidth - margin;
  const maxTop = boardRect.height - el.offsetHeight - margin;

  const left = Math.random() * maxLeft + margin;
  const top = Math.random() * maxTop + margin;

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

function makeDraggable(el) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const board = document.getElementById("boardContainer");

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const boardRect = board.getBoundingClientRect();
    const elWidth = el.offsetWidth;
    const elHeight = el.offsetHeight;

    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    // Clamp within bounds of the board
    x = Math.max(10, Math.min(x, boardRect.width - elWidth - 10));
    y = Math.max(10, Math.min(y, boardRect.height - elHeight - 10));

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    el.style.cursor = "grab";
  });
}

// 🔊 Mute/unmute toggle
window.addEventListener("load", () => {
  const bgAudio = document.getElementById("bg-audio");
  const audioBtn = document.getElementById("audioToggle");

  if (!bgAudio || !audioBtn) {
    console.warn("🔇 Audio elements not found in DOM.");
    return;
  }

  bgAudio.volume = 0.2;

  audioBtn.addEventListener("click", () => {
    if (bgAudio.muted) {
      bgAudio.muted = false;
      audioBtn.textContent = "🔊";
    } else {
      bgAudio.muted = true;
      audioBtn.textContent = "🔇";
    }
  });

  // ▶️ Start audio only after user interaction
  window.addEventListener(
    "click",
    () => {
      if (bgAudio.paused) {
        bgAudio.play().catch((e) => console.warn("Autoplay blocked:", e));
      }
    },
    { once: true }
  );
});
