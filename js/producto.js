// js/producto.js
document.addEventListener("DOMContentLoaded", () => {
  const id = getQueryParam("id");
  const product = window.PRODUCTS.find(p => p.id === id);

  const container = document.getElementById("productDetail");
  if (!product) {
    container.innerHTML = `
      <div class="card p-24">
        <h1 class="h2">Producto no encontrado</h1>
        <p class="muted">El producto solicitado no existe o fue retirado.</p>
        <a class="btn btn-primary mt-16" href="productos.html">Volver al catálogo</a>
      </div>
    `;
    return;
  }

  document.title = `${product.name} | ${window.APP_CONFIG?.COMPANY_NAME || "EPP"}`;

  container.innerHTML = `
    <div class="card detail">
      <div class="detail-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="detail-body">
        <div class="chip">${product.category}</div>
        <h1 class="h1 mt-10">${product.name}</h1>

        <div class="detail-meta">
          <div><span class="muted">Código:</span> <strong>${product.code}</strong></div>
          <div><span class="muted">ID:</span> <strong>${product.id}</strong></div>
        </div>

        <div class="detail-price">${formatPrice(product.price)}</div>

        <p class="detail-short">${product.short}</p>

        <div class="specs">
          <div class="specs-title">Especificaciones</div>
          <ul>
            ${product.specs.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>

        <div class="detail-actions">
          <a class="btn btn-wa" target="_blank" rel="noopener" href="${buildWhatsAppLink(product)}">
            Consultar por WhatsApp
          </a>
          <a class="btn btn-ghost" href="productos.html?cat=${encodeURIComponent(product.category)}">
            Ver más en ${product.category}
          </a>
        </div>

        <div class="note">
          <strong>Cotiza ahora:</strong> Confirma disponibilidad, precios por volumen y tiempos de entrega en minutos.
        </div>
      </div>
    </div>
  `;

  // ✅ SEO PRO: JSON-LD dinámico (schema.org Product)
  // Nota: en local el "url" será window.location.href. En hosting quedará automáticamente con tu dominio.
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "sku": product.code,
    "image": [product.image],
    "description": product.short,
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": window.APP_CONFIG?.COMPANY_NAME || "B & B SEGURIDAD SAC"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PEN",
      "price": Number(product.price).toFixed(2),
      // Si luego conectas stock real, esto se vuelve dinámico
      "availability": "https://schema.org/InStock",
      "url": window.location.href
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
});