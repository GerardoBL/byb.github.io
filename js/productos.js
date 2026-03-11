// js/productos.js (PRO: filtro + búsqueda + orden + paginación 12)
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productsGrid");
  const search = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const sortSelect = document.getElementById("sortSelect");
  const resultCount = document.getElementById("resultCount");
  const clearBtn = document.getElementById("clearFilters");
  const pager = document.getElementById("pager");

  const PAGE_SIZE = 12;

  const state = {
    q: getQueryParam("q") || "",
    cat: getQueryParam("cat") || "",
    sort: getQueryParam("sort") || "relevancia",
    page: Math.max(1, parseInt(getQueryParam("page") || "1", 10))
  };

  // Cargar categorías
  window.CATEGORIES.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  search.value = state.q;
  categorySelect.value = state.cat;
  sortSelect.value = state.sort;

  function normalize(str) {
    return (str || "").toLowerCase();
  }

  function scoreRelevance(p, q) {
    // ranking simple (mejoras futuras: fuzzy)
    const name = normalize(p.name);
    const code = normalize(p.code);
    const id = normalize(p.id);
    if (!q) return 0;
    if (code.includes(q)) return 3;
    if (id.includes(q)) return 2;
    if (name.includes(q)) return 1;
    return 0;
  }

  function getFiltered() {
    const q = normalize(state.q.trim());
    const cat = state.cat;

    let list = window.PRODUCTS.filter(p => {
      const matchCat = !cat || p.category === cat;
      const matchQ =
        !q ||
        normalize(p.name).includes(q) ||
        normalize(p.code).includes(q) ||
        normalize(p.id).includes(q);

      return matchCat && matchQ;
    });

    // Ordenamiento
    if (state.sort === "menor") {
      list.sort((a,b) => a.price - b.price);
    } else if (state.sort === "mayor") {
      list.sort((a,b) => b.price - a.price);
    } else {
      // relevancia
      list.sort((a,b) => scoreRelevance(b, q) - scoreRelevance(a, q));
    }

    return list;
  }

  function renderPager(totalItems) {
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;

    const prevDisabled = state.page <= 1;
    const nextDisabled = state.page >= totalPages;

    pager.innerHTML = `
      <button class="btn btn-ghost" ${prevDisabled ? "disabled" : ""} data-page="${state.page - 1}">← Anterior</button>
      <div class="muted" style="font-weight:800;">Página ${state.page} de ${totalPages}</div>
      <button class="btn btn-ghost" ${nextDisabled ? "disabled" : ""} data-page="${state.page + 1}">Siguiente →</button>
    `;

    pager.querySelectorAll("button[data-page]").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = parseInt(btn.getAttribute("data-page"), 10);
        if (!Number.isNaN(p)) {
          state.page = p;
          updateURL();
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  function updateURL() {
    const url = new URL(window.location.href);
    state.cat ? url.searchParams.set("cat", state.cat) : url.searchParams.delete("cat");
    state.q ? url.searchParams.set("q", state.q) : url.searchParams.delete("q");
    state.sort ? url.searchParams.set("sort", state.sort) : url.searchParams.delete("sort");
    url.searchParams.set("page", String(state.page));
    window.history.replaceState({}, "", url);
  }

  function render() {
    const list = getFiltered();
    const total = list.length;

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);

    grid.innerHTML = "";
    pageItems.forEach(p => grid.appendChild(createProductCard(p)));

    resultCount.textContent = `${total} producto(s) encontrado(s) • Mostrando ${pageItems.length} (12 por página)`;
    renderPager(total);
  }

  // Eventos
  search.addEventListener("input", () => {
    state.q = search.value;
    state.page = 1;
    updateURL();
    render();
  });

  categorySelect.addEventListener("change", () => {
    state.cat = categorySelect.value;
    state.page = 1;
    updateURL();
    render();
  });

  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    state.page = 1;
    updateURL();
    render();
  });

  clearBtn.addEventListener("click", () => {
    state.q = "";
    state.cat = "";
    state.sort = "relevancia";
    state.page = 1;
    search.value = "";
    categorySelect.value = "";
    sortSelect.value = "relevancia";
    updateURL();
    render();
  });

  updateURL();
  render();
});