/*
  6-month wish banner.
  The words and photos live in config.js. This file runs the show:
  envelope → banner → shooting star → reveal → finale.
*/
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // The folder this script is served from, so the file names in config.js
  // work whether the page is opened as /6months or /6months/.
  const BASE = new URL(".", document.currentScript.src);
  const STORAGE_KEY = "six-month-wishes-v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof CONFIG === "undefined" || !Array.isArray(CONFIG.cards) || CONFIG.cards.length === 0) {
    document.body.innerHTML =
      '<p class="config-error">Something in <code>6months/config.js</code> has a typo, usually a missing comma or quote.</p>';
    return;
  }

  /* ---------- Content ---------- */

  const cards = CONFIG.cards.map((card, i, all) => ({
    label: card.label || `Month ${i + 1}`,
    title: card.title || "",
    memory: card.memory || "",
    photo: card.photo ? new URL(card.photo, BASE).href : "",
    pixelArt: card.pixelArt ? new URL(card.pixelArt, BASE).href : "",
    bonus: card.bonus || "",
    rarity: Number(card.rarity) || (i === all.length - 1 ? 5 : 4),
  }));
  const total = cards.length;
  const bannerTitle = CONFIG.bannerTitle || "Half a Year of Us";

  const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  const SUFFIXES = ["th", "st", "nd", "rd"];
  const ordinal = (n) => n + (SUFFIXES[((n % 100) - 20) % 10] || SUFFIXES[n % 100] || "th");
  // Big titles shouldn't leave one word alone on the last line ("Half a Year of / Us")
  const keepLastWordsTogether = (text) => text.replace(/ (\S+)$/, " $1");

  $$("[data-her-name]").forEach((el) => (el.textContent = CONFIG.herName || "you"));
  $$("[data-wish-count]").forEach((el) => (el.textContent = total));
  $$("[data-banner-title]").forEach((el) => (el.textContent = keepLastWordsTogether(bannerTitle)));
  document.title = `${bannerTitle} ✦`;
  $("#banner-desc").textContent =
    `${NUMBER_WORDS[total] || total} Intertwined Fates, one for every month together. ` +
    `A 5★ is guaranteed on the ${ordinal(total)} wish.`;

  /* ---------- Progress, kept in this browser so a refresh doesn't lose her place ---------- */

  // Open the page with ?reset on the end to start over (handy after testing).
  if (new URLSearchParams(location.search).has("reset")) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Storage is blocked, so there's nothing to reset.
    }
    window.history.replaceState(null, "", location.pathname);
  }

  function loadTimes() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.times)) return saved.times.slice(0, total);
    } catch (error) {
      // Private mode or blocked storage: start fresh.
    }
    return [];
  }

  function saveTimes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ times }));
    } catch (error) {
      // The gift still works, it just won't remember her place.
    }
  }

  let times = loadTimes(); // times[i] = when wish i was made

  /* ---------- Together counter ---------- */

  function parseDate(value) {
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(value || "").trim());
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  }

  const start = parseDate(CONFIG.startDate);
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const ms = Math.max(0, Date.now() - start.getTime());
    const days = Math.floor(ms / 86400000);
    const clock = `${pad(Math.floor(ms / 3600000) % 24)}h ${pad(Math.floor(ms / 60000) % 60)}m ${pad(Math.floor(ms / 1000) % 60)}s`;
    $$("[data-days]").forEach((el) => (el.textContent = `${days.toLocaleString("en")} ${days === 1 ? "day" : "days"}`));
    $$("[data-clock]").forEach((el) => (el.textContent = clock));
  }

  if (start) {
    tick();
    setInterval(tick, 1000);
  } else {
    // No start date in config.js: leave the counter out rather than show a made-up number
    $$(".together").forEach((el) => (el.hidden = true));
  }

  /* ---------- Decoration ---------- */

  const random = (min, max) => min + Math.random() * (max - min);

  function scatter(container, count, make) {
    for (let i = 0; i < count; i++) container.append(make());
  }

  function pixelStar() {
    const star = document.createElement("i");
    const size = Math.random() < 0.2 ? 4 : 2;
    Object.assign(star.style, {
      left: `${random(0, 100)}%`,
      top: `${random(0, 100)}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${random(0, 3).toFixed(2)}s`,
    });
    return star;
  }

  function fallingHeart() {
    const heart = document.createElement("span");
    heart.innerHTML = '<svg viewBox="0 0 7 6"><use href="#i-heart" /></svg>';
    const duration = random(7, 14);
    Object.assign(heart.style, {
      left: `${random(0, 100)}%`,
      width: `${random(14, 30).toFixed(0)}px`,
      opacity: random(0.35, 0.8).toFixed(2),
      animationDuration: `${duration.toFixed(1)}s`,
      // A negative delay so they're already mid-fall when the finale opens
      animationDelay: `${(-random(0, duration)).toFixed(1)}s`,
    });
    heart.style.setProperty("--drift", `${random(-40, 40).toFixed(0)}px`);
    return heart;
  }

  scatter($("#banner-stars"), 28, pixelStar);
  scatter($("#sky-stars"), 110, pixelStar);
  scatter($("#falling-hearts"), 22, fallingHeart);

  /* ---------- Screens ---------- */

  const screens = {
    intro: $("#intro"),
    banner: $("#banner"),
    sky: $("#sky"),
    reveal: $("#reveal"),
    finale: $("#finale"),
  };

  function show(name, extraClasses = []) {
    for (const [key, el] of Object.entries(screens)) {
      el.hidden = key !== name;
      el.classList.remove("enter", "fresh", "first");
    }
    const el = screens[name];
    void el.offsetWidth; // restart the entrance animations
    el.classList.add("enter", ...extraClasses);
  }

  /* ---------- Sound, made in the browser so there are no audio files ---------- */

  const sound = (() => {
    let ctx = null;
    let out = null;
    let muted = false;
    let playing = [];

    function ready() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        ctx = new AudioCtx();
        out = ctx.createGain();
        out.gain.value = muted ? 0 : 0.5;
        out.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    }

    function schedule(node, startAt, stopAt) {
      playing.push(node);
      node.onended = () => (playing = playing.filter((n) => n !== node));
      node.start(startAt);
      node.stop(stopAt);
    }

    function tone(freq, at, length, { type = "sine", volume = 0.2, glideTo = 0 } = {}) {
      const c = ready();
      if (!c) return;
      const t = c.currentTime + at;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + length);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
      osc.connect(gain).connect(out);
      schedule(osc, t, t + length + 0.05);
    }

    // Rising filtered noise while the star flies in
    function whoosh(length, at) {
      const c = ready();
      if (!c) return;
      const t = c.currentTime + at;
      const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * (length + 0.3)), c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 0.9;
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(3000, t + length);
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + length * 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.25);
      noise.connect(filter).connect(gain).connect(out);
      schedule(noise, t, t + length + 0.3);
    }

    // A soft low thump when the star lands
    const thump = (at, rarity) => tone(rarity >= 5 ? 150 : 180, at, 0.9, { volume: 0.3, glideTo: 50 });

    // Bell arpeggio for the reveal, brighter and longer for a 5★
    function chime(rarity) {
      const notes =
        rarity >= 5 ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98] : [587.33, 739.99, 880, 1174.66];
      notes.forEach((freq, i) => tone(freq, i * 0.085, 1.5, { volume: 0.12 }));
      tone(notes[0] / 2, 0, 2, { type: "triangle", volume: 0.1 });
      if (rarity >= 5) notes.forEach((freq, i) => tone(freq * 2, 0.55 + i * 0.06, 1.2, { volume: 0.04 }));
    }

    const click = () => tone(1318.51, 0, 0.12, { type: "triangle", volume: 0.05 });

    function stopAll() {
      playing.forEach((node) => {
        try {
          node.stop();
        } catch (error) {
          // Already stopped.
        }
      });
      playing = [];
    }

    function setMuted(value) {
      muted = value;
      if (out) out.gain.value = muted ? 0 : 0.5;
    }

    return { ready, whoosh, thump, chime, click, stopAll, setMuted, isMuted: () => muted };
  })();

  const song = $("#song");

  function startSong() {
    if (!CONFIG.song || song.getAttribute("src")) return;
    song.src = new URL(CONFIG.song, BASE).href;
    song.volume = 0.45;
    song.play().catch(() => {
      // Autoplay can still be refused; the gift works without music.
    });
  }

  const muteButton = $("#mute");
  muteButton.addEventListener("click", () => {
    const muted = !sound.isMuted();
    sound.setMuted(muted);
    song.muted = muted;
    muteButton.setAttribute("aria-pressed", String(muted));
    muteButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  });

  /* ---------- 1. Envelope ---------- */

  let firstBanner = true;

  $("#envelope").addEventListener(
    "click",
    () => {
      sound.ready();
      sound.click();
      startSong();
      screens.intro.classList.add("opening");
      setTimeout(() => (times.length >= total ? showFinale() : showBanner()), reduceMotion ? 0 : 750);
    },
    { once: true },
  );

  /* ---------- 2. Banner ---------- */

  function showBanner() {
    renderBanner();
    show("banner", firstBanner ? ["first"] : []);
    firstBanner = false;
    $("#wish1").focus({ preventScroll: true });
  }

  function renderBanner() {
    const left = total - times.length;
    $("#fate-count").textContent = left;
    const pity = $("#pity");
    pity.classList.toggle("is-next", left === 1);
    if (left > 1) pity.textContent = `5★ guaranteed in ${left} wishes`;
    else if (left === 1) pity.textContent = "Next wish is a guaranteed 5★ ✦";
    else pity.textContent = "All wishes made ✦";
    $("#wish1").classList.toggle("is-ready", left === 1);
  }

  let toastTimer = 0;

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
  }

  $("#wish10").addEventListener("click", () => {
    sound.click();
    toast("Not enough Intertwined Fates. You only get one a month, so make each one count ♡");
  });

  $("#plus").addEventListener("click", () => {
    sound.click();
    toast("Fates can't be bought. They're earned, one month at a time ♡");
  });

  /* ---------- 3. Shooting star ---------- */

  let wishing = null; // index of the wish whose star is in the air
  let landTimer = 0;

  $("#wish1").addEventListener("click", () => {
    if (wishing !== null) return;
    if (times.length >= total) {
      showFinale();
      return;
    }
    sound.click();
    makeWish(times.length);
  });

  function makeWish(index) {
    wishing = index;
    const { rarity } = cards[index];
    const fly = reduceMotion ? 0 : rarity >= 5 ? 2.1 : 1.5; // seconds the star is in the air
    screens.sky.dataset.rarity = rarity;
    screens.sky.style.setProperty("--fly", `${fly}s`);
    show("sky");
    if (!reduceMotion) {
      sound.whoosh(fly, 0.35);
      sound.thump(0.35 + fly, rarity);
    }
    // Matches the CSS: a 0.35s pause, the flight, then the burst and the white flash
    landTimer = setTimeout(landWish, reduceMotion ? 350 : (fly + 1.2) * 1000);
  }

  function landWish() {
    if (wishing === null) return;
    clearTimeout(landTimer);
    const index = wishing;
    wishing = null;
    if (times.length === index) {
      times.push(Date.now());
      saveTimes();
    }
    showReveal(index, { fresh: true, back: times.length >= total ? "finale" : "banner" });
  }

  $("#skip").addEventListener("click", (event) => {
    event.stopPropagation();
    sound.stopAll();
    landWish();
  });

  /* ---------- 4. Reveal ---------- */

  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-star" /></svg>';
  let backTo = "banner";
  let canLeave = false;
  let leaveTimer = 0;

  function showReveal(index, { fresh = false, back = "banner" } = {}) {
    const card = cards[index];
    screens.reveal.dataset.rarity = card.rarity;

    $("#reveal-label").textContent = card.label;
    $("#new-badge").hidden = !fresh;
    $("#reveal-title").textContent = keepLastWordsTogether(card.title);
    $("#reveal-memory").textContent = card.memory;

    const stars = $("#reveal-stars");
    stars.innerHTML = Array.from({ length: card.rarity }, (_, i) => STAR.replace("<svg", `<svg style="--i: ${i}"`)).join("");
    stars.setAttribute("aria-label", `${card.rarity} stars`);

    const photo = $("#reveal-photo");
    photo.classList.toggle("is-pixel-art", !card.photo);
    photo.src = card.photo || card.pixelArt || (card.rarity >= 5 ? "/cat_dance.gif" : "/cat_heart.gif");
    photo.alt = card.photo ? card.title : "";

    $("#bonus").hidden = !card.bonus;
    $("#bonus-label").textContent = card.rarity >= 5 ? "5★ Reward" : "Bonus";
    $("#bonus-text").textContent = card.bonus;

    backTo = back;
    show("reveal", fresh ? ["fresh"] : []);
    screens.reveal.scrollTop = 0;
    if (fresh) sound.chime(card.rarity);

    // A short pause so the tap that skipped the star doesn't also skip the card
    canLeave = false;
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => (canLeave = true), fresh ? 1200 : 300);
  }

  function leaveReveal() {
    if (!canLeave) return;
    canLeave = false;
    sound.click();
    if (backTo === "finale") showFinale();
    else showBanner();
  }

  screens.reveal.addEventListener("click", leaveReveal);

  document.addEventListener("keydown", (event) => {
    if (screens.reveal.hidden || document.querySelector("dialog[open]")) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      leaveReveal();
    }
  });

  /* ---------- 5. Finale ---------- */

  function showFinale() {
    const reward = cards[total - 1].bonus;
    $("#final-reward").textContent = reward;
    $(".reward").hidden = !reward;
    renderCollection();
    show("finale");
    screens.finale.scrollTop = 0;
  }

  function renderCollection() {
    $("#collection").replaceChildren(
      ...cards.map((card, i) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mini-card";
        button.dataset.rarity = card.rarity;
        button.innerHTML = '<span class="mini-stars"></span><span class="mini-label"></span><span class="mini-title"></span>';
        button.querySelector(".mini-stars").textContent = "★".repeat(card.rarity);
        button.querySelector(".mini-label").textContent = card.label;
        button.querySelector(".mini-title").textContent = card.title;
        button.addEventListener("click", () => showReveal(i, { back: "finale" }));
        return button;
      }),
    );
  }

  $("#replay").addEventListener("click", () => {
    sound.click();
    times = [];
    saveTimes();
    firstBanner = true;
    showBanner();
  });

  /* ---------- Details and history ---------- */

  const detailsDialog = $("#details");
  const historyDialog = $("#history");

  $("#details-btn").addEventListener("click", () => {
    sound.click();
    detailsDialog.showModal();
  });

  $("#history-btn").addEventListener("click", () => {
    sound.click();
    renderHistory();
    historyDialog.showModal();
  });

  // Close on the × button or a tap outside the sheet
  $$("dialog").forEach((dialog) =>
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
    }),
  );

  function formatTime(ms) {
    const d = new Date(ms);
    return [
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    ];
  }

  function renderHistory() {
    const rows = $("#history-rows");
    rows.replaceChildren();
    if (!times.length) {
      rows.innerHTML = '<tr><td colspan="3" class="history-empty">No wishes yet. Your first one is waiting ✦</td></tr>';
      return;
    }
    // Newest first, like the game
    times
      .map((time, index) => ({ time, index }))
      .reverse()
      .forEach(({ time, index }) => {
        const card = cards[index];
        const row = document.createElement("tr");
        row.className = `r${card.rarity}`;
        row.innerHTML =
          '<td><button class="history-item" type="button"></button></td>' +
          '<td class="history-rarity"></td>' +
          '<td class="history-time"><span></span><span></span></td>';
        const item = row.querySelector(".history-item");
        item.textContent = card.title;
        item.addEventListener("click", () => {
          historyDialog.close();
          showReveal(index, { back: "banner" });
        });
        row.querySelector(".history-rarity").textContent = `${card.rarity}★`;
        const [dateCell, clockCell] = row.querySelectorAll(".history-time span");
        [dateCell.textContent, clockCell.textContent] = formatTime(time);
        rows.append(row);
      });
  }

  renderBanner();
})();
