// js/marcas.js
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.getElementById("brandsViewport");
  const track = document.getElementById("brandsTrack");
  const dotsWrap = document.getElementById("brandsDots");
  const btnPrev = document.getElementById("brandsPrev");
  const btnNext = document.getElementById("brandsNext");

  if (!viewport || !track || !dotsWrap) return;

  // ✅ Lista de marcas (edítala según tus logos reales)
  const BRANDS = [
    { name: "3M", file: "assets/img/brands/3m.png" },
    { name: "MSA", file: "assets/img/brands/msa.png" },
    { name: "Ansell", file: "assets/img/brands/ansell.png" },
    { name: "Uvex", file: "assets/img/brands/uvex.png" },
    { name: "Delta Plus", file: "assets/img/brands/delta-plus.png" },
    { name: "Caterpillar", file: "assets/img/brands/caterpillar.png" },
    { name: "Dräger", file: "assets/img/brands/drager.png" },
    { name: "Safety Jogger", file: "assets/img/brands/safety-jogger.png" }
  ];

  // Render items (duplicados para loop suave)
  const renderItems = (list) => {
    track.innerHTML = "";
    const all = [...list, ...list]; // duplicar para loop
    all.forEach((b, idx) => {
      const a = document.createElement("a");
      a.className = "brand-item";
      a.href = "productos.html"; // puedes mandar a un filtro específico si luego creas marcas
      a.setAttribute("aria-label", `Marca: ${b.name}`);
      a.innerHTML = `<img src="${b.file}" alt="${b.name}" loading="lazy">`;
      track.appendChild(a);
    });
  };

  renderItems(BRANDS);

  // Dots (uno por "pantalla" lógica, no por item)
  // Regla: cada paso avanza 1 item; dot = "grupo" de 4 (desktop) / 3 (tablet) / 2 (mobile)
  const getPerView = () => {
    const w = window.innerWidth;
    if (w <= 640) return 2;
    if (w <= 960) return 3;
    return 4;
  };

  let perView = getPerView();
  let index = 0; // índice del primer item visible (sobre lista original BRANDS)
  let stepPx = 0;
  let autoTimer = null;

  const computeStep = () => {
    // medimos ancho del item + gap
    const first = track.querySelector(".brand-item");
    if (!first) return 0;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap || "12");
    return first.getBoundingClientRect().width + gap;
  };

  const buildDots = () => {
    dotsWrap.innerHTML = "";
    const pages = Math.ceil(BRANDS.length / perView);
    for (let p = 0; p < pages; p++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "brands-dot";
      dot.setAttribute("aria-label", `Ir a marcas página ${p + 1}`);
      dot.addEventListener("click", () => {
        index = p * perView;
        sync(true);
      });
      dotsWrap.appendChild(dot);
    }
  };

  const setDotsActive = () => {
    const pages = Math.ceil(BRANDS.length / perView);
    const page = Math.min(pages - 1, Math.floor(index / perView));
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle("active", i === page));
  };

  const translateToIndex = (i, animate = true) => {
    if (!stepPx) stepPx = computeStep();

    track.style.transition = animate ? "transform .45s ease" : "none";

    // Queremos mover sobre la pista duplicada; usamos i en rango [0..BRANDS.length-1]
    // translateX = -(i * step)
    track.style.transform = `translateX(${-i * stepPx}px)`;
  };

  const sync = (animate = true) => {
    perView = getPerView();
    buildDots();
    setDotsActive();
    stepPx = computeStep();
    translateToIndex(index, animate);
    updateAria();
  };

  const next = () => {
    index++;
    if (index >= BRANDS.length) {
      // saltamos sin animación al inicio para loop perfecto
      index = 0;
      translateToIndex(BRANDS.length, true); // animamos al final de la copia
      setTimeout(() => translateToIndex(0, false), 460);
    } else {
      translateToIndex(index, true);
    }
    setDotsActive();
  };

  const prev = () => {
    index--;
    if (index < 0) {
      // vamos al final sin salto brusco
      index = BRANDS.length - 1;
      translateToIndex(0, false);
      translateToIndex(index, true);
    } else {
      translateToIndex(index, true);
    }
    setDotsActive();
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(() => next(), 2600);
  };

  const stopAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  };

  const updateAria = () => {
    // Opcional: puedes mejorar accesibilidad, no imprescindible
    viewport.setAttribute("aria-roledescription", "carrusel");
  };

  // Controls
  btnNext && btnNext.addEventListener("click", () => { next(); startAuto(); });
  btnPrev && btnPrev.addEventListener("click", () => { prev(); startAuto(); });

  // Pause on hover
  viewport.addEventListener("mouseenter", stopAuto);
  viewport.addEventListener("mouseleave", startAuto);

  // Touch (swipe)
  let x0 = null;
  viewport.addEventListener("touchstart", (e) => {
    x0 = e.touches?.[0]?.clientX ?? null;
    stopAuto();
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    const x1 = e.changedTouches?.[0]?.clientX ?? null;
    if (x0 !== null && x1 !== null) {
      const dx = x1 - x0;
      if (Math.abs(dx) > 35) {
        dx < 0 ? next() : prev();
      }
    }
    x0 = null;
    startAuto();
  }, { passive: true });

  // Resize
  window.addEventListener("resize", () => {
    const newPer = getPerView();
    if (newPer !== perView) {
      // Ajuste a múltiplo de perView para que dots sean coherentes
      index = Math.min(BRANDS.length - 1, Math.floor(index / newPer) * newPer);
    }
    sync(false);
  });

  // Init
  sync(false);
  startAuto();
});