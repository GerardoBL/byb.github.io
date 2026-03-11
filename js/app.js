// js/app.js
function formatPrice(value) {
  const cur = (window.APP_CONFIG?.CURRENCY || "S/.");
  return `${cur} ${Number(value).toFixed(2)}`;
}

function getQueryParam(key) {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function buildWhatsAppLink(product) {
  const phone = window.APP_CONFIG?.WHATSAPP_NUMBER || "";
  const company = window.APP_CONFIG?.COMPANY_NAME || "Empresa";
  const text = [
    `Hola, vengo desde ${company}.`,
    `Quiero cotizar este producto:`,
    `• Nombre: ${product.name}`,
    `• Código: ${product.code}`,
    `• Precio: ${formatPrice(product.price)}`,
    ``,
    `¿Tienen stock y tiempo de entrega?`
  ].join("\n");

  const encoded = encodeURIComponent(text);
  // wa.me funciona tanto en móvil como desktop (redirige a web/app)
  return `https://wa.me/${phone}?text=${encoded}`;
}

function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === path);
  });
}

function createProductCard(product) {
  const a = document.createElement("article");
  a.className = "card product-card";
  a.innerHTML = `
    <a class="product-media" href="producto.html?id=${encodeURIComponent(product.id)}" aria-label="Ver detalle de ${product.name}">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <span class="chip">${product.category}</span>
    </a>
    <div class="product-body">
      <div class="product-title">${product.name}</div>
      <div class="product-meta">
        <span class="muted">Código: <strong>${product.code}</strong></span>
      </div>
      <div class="product-row">
        <div class="price">${formatPrice(product.price)}</div>
        <a class="btn btn-ghost" href="producto.html?id=${encodeURIComponent(product.id)}">Ver detalle</a>
      </div>
      <a class="btn btn-wa" target="_blank" rel="noopener" href="${buildWhatsAppLink(product)}">
        Consultar por WhatsApp
      </a>
    </div>
  `;
  return a;
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
});