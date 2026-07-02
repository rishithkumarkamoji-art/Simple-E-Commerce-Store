const REGIONS = {
  india: {
    label: "India",
    locale: "en-IN",
    currency: "INR",
    conversionRate: 83,
    heroEyebrow: "India store",
    heroTitle: "Shop daily essentials for India and abroad.",
    heroCopy: "Prices display in INR with GST-style checkout, PIN-code labels, and local delivery rules.",
    searchPlaceholder: "Backpack, lamp, filter coffee",
    checkoutEyebrow: "India checkout",
    checkoutTitle: "Delivery details",
    cityLabel: "City",
    stateLabel: "State",
    zipLabel: "PIN code",
    shippingLabel: "Local delivery",
    taxLabel: "GST",
    freeShippingThresholdCents: 6000,
    shippingCents: 179,
    taxRate: 0.18
  },
  international: {
    label: "International",
    locale: "en-US",
    currency: "USD",
    conversionRate: 1,
    heroEyebrow: "International store",
    heroTitle: "Shop daily essentials for global delivery.",
    heroCopy: "Prices display in USD with international shipping, standard tax estimates, and global checkout labels.",
    searchPlaceholder: "Backpack, lamp, coffee",
    checkoutEyebrow: "Checkout",
    checkoutTitle: "Shipping details",
    cityLabel: "City",
    stateLabel: "State",
    zipLabel: "ZIP",
    shippingLabel: "Shipping",
    taxLabel: "Estimated tax",
    freeShippingThresholdCents: 10000,
    shippingCents: 799,
    taxRate: 0.0825
  }
};

const SOCIAL_PROVIDERS = {
  google: "Google",
  apple: "Apple ID",
  microsoft: "Microsoft",
  yahoo: "Yahoo",
};

const state = {
  user: null,
  cart: { items: [], subtotal_cents: 0, item_count: 0 },
  products: [],
  currentProduct: null,
  authMode: "login",
  region: getInitialRegion(),
  toastTimer: null
};

function $(selector) {
  return document.querySelector(selector);
}

function getInitialRegion() {
  try {
    const saved = localStorage.getItem("marketLaneRegion");
    return REGIONS[saved] ? saved : "india";
  } catch (error) {
    return "india";
  }
}

function regionConfig(region = state.region) {
  return REGIONS[region] || REGIONS.india;
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function formatMoney(cents, region = state.region) {
  const config = regionConfig(region);
  const convertedCents = Math.round((cents || 0) * config.conversionRate);
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: config.currency === "INR" ? 0 : 2
  }).format(convertedCents / 100);
}

function productSearchMatches(product, term) {
  return [product.name, product.category, product.description]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

function filteredProducts() {
  const term = $("#searchInput")?.value.trim().toLowerCase() || "";
  return term ? state.products.filter((product) => productSearchMatches(product, term)) : state.products;
}

function applyRegionChrome() {
  const config = regionConfig();
  document.documentElement.lang = state.region === "india" ? "en-IN" : "en";
  document.body.dataset.region = state.region;

  document.querySelectorAll("[data-region]").forEach((button) => {
    const active = button.dataset.region === state.region;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  setText("#regionEyebrow", config.heroEyebrow);
  setText("#heroTitle", config.heroTitle);
  setText("#heroCopy", config.heroCopy);
  setText("#checkoutEyebrow", config.checkoutEyebrow);
  setText("#checkoutTitle", config.checkoutTitle);
  setText("#cityLabel", config.cityLabel);
  setText("#stateLabel", config.stateLabel);
  setText("#zipLabel", config.zipLabel);
  setText("#summaryShippingLabel", config.shippingLabel);
  setText("#summaryTaxLabel", config.taxLabel);

  const searchInput = $("#searchInput");
  if (searchInput) searchInput.placeholder = config.searchPlaceholder;
}

function setRegion(region) {
  if (!REGIONS[region] || region === state.region) return;
  state.region = region;
  try {
    localStorage.setItem("marketLaneRegion", region);
  } catch (error) {
    // Region still changes for the current tab if storage is unavailable.
  }

  applyRegionChrome();
  renderProducts(filteredProducts());
  if (state.currentProduct) renderProductDetail(state.currentProduct);
  renderCart();
  if (document.body.dataset.page === "checkout") renderCheckout();
  showToast(`${regionConfig().label} store selected`);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "same-origin",
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function setMessage(selector, message) {
  const element = $(selector);
  if (element) element.textContent = message || "";
}

function updateHeader() {
  const accountLabel = $("#accountLabel");
  const authButton = $("#authButton");
  const logoutButton = $("#logoutButton");
  const cartCount = $("#cartCount");

  if (accountLabel) accountLabel.textContent = state.user ? state.user.name : "";
  if (authButton) authButton.hidden = Boolean(state.user);
  if (logoutButton) logoutButton.hidden = !state.user;
  if (cartCount) cartCount.textContent = state.cart.item_count || 0;
}

function openAuth(mode = "login") {
  state.authMode = mode;
  renderAuthMode();
  $("#authModal")?.showModal();
}

function renderAuthMode() {
  const isRegister = state.authMode === "register";
  $("#authTitle").textContent = isRegister ? "Create account" : "Sign in";
  $("#authSubmit").textContent = isRegister ? "Create account" : "Sign in";
  $("#nameField").hidden = !isRegister;
  $("#loginTab").classList.toggle("active", !isRegister);
  $("#registerTab").classList.toggle("active", isRegister);
  setMessage("#authMessage", "");
}

function openCart() {
  if (!state.user) {
    openAuth("login");
    return;
  }
  renderCart();
  document.body.classList.add("drawer-open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.body.classList.remove("drawer-open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
}

function emptyMarkup(title, copy) {
  return `<div class="empty-state"><strong>${title}</strong><p>${copy}</p></div>`;
}

function renderCart() {
  const cartItems = $("#cartItems");
  if (!cartItems) return;

  if (!state.cart.items.length) {
    cartItems.innerHTML = emptyMarkup("Your cart is empty.", "Add something useful and good-looking.");
  } else {
    cartItems.innerHTML = state.cart.items.map((item) => `
      <article class="cart-line">
        <img src="${item.image_url}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <span class="price">${formatMoney(item.line_total_cents)}</span>
          <div class="quantity-row">
            <div class="quantity-controls" aria-label="Quantity for ${item.name}">
              <button type="button" data-qty="${item.quantity - 1}" data-product="${item.product_id}" aria-label="Decrease quantity">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-qty="${item.quantity + 1}" data-product="${item.product_id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-button" type="button" data-remove="${item.product_id}">Remove</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  $("#cartSubtotal").textContent = formatMoney(state.cart.subtotal_cents);
  $("#checkoutLink").classList.toggle("disabled", !state.cart.items.length);
}

async function loadMe() {
  const data = await api("/api/me");
  state.user = data.user;
  updateHeader();
}

async function loadCart() {
  if (!state.user) {
    state.cart = { items: [], subtotal_cents: 0, item_count: 0 };
    updateHeader();
    return;
  }
  const data = await api("/api/cart");
  state.cart = data.cart;
  updateHeader();
  renderCart();
}

async function addToCart(productId, quantity = 1) {
  try {
    const data = await api("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity })
    });
    state.cart = data.cart;
    updateHeader();
    renderCart();
    showToast("Added to cart");
  } catch (error) {
    if (error.status === 401) {
      openAuth("login");
      return;
    }
    showToast(error.message);
  }
}

function productCard(product) {
  return `
    <article class="product-card">
      <a href="/product.html?slug=${product.slug}" aria-label="View ${product.name}">
        <img src="${product.image_url}" alt="${product.name}">
      </a>
      <div class="product-card-body">
        <span class="category-chip">${product.category}</span>
        <div class="product-title-row">
          <h3>${product.name}</h3>
          <span class="price">${formatMoney(product.price_cents)}</span>
        </div>
        <p>${product.description}</p>
        <div class="card-actions">
          <button class="primary-button" type="button" data-add="${product.id}">Add to cart</button>
          <a class="text-link" href="/product.html?slug=${product.slug}">Details</a>
        </div>
      </div>
    </article>
  `;
}

function renderProducts(products) {
  const grid = $("#productGrid");
  if (!grid) return;
  grid.innerHTML = products.length
    ? products.map(productCard).join("")
    : emptyMarkup("No products found.", "Try a different search.");
}

async function initHome() {
  const data = await api("/api/products");
  state.products = data.products;
  renderProducts(filteredProducts());

  $("#searchInput")?.addEventListener("input", (event) => {
    renderProducts(filteredProducts());
  });
}

function renderProductDetail(product) {
  const detail = $("#productDetail");
  if (!detail) return;
  const config = regionConfig();
  document.title = `${product.name} | Market Lane Global`;
  detail.innerHTML = `
    <div class="detail-media">
      <img src="${product.image_url}" alt="${product.name}">
    </div>
    <div class="detail-panel">
      <div>
        <p class="eyebrow">${product.category}</p>
        <h1>${product.name}</h1>
      </div>
      <p class="detail-copy">${product.description}</p>
      <div class="detail-facts">
        <div><span>Price</span><strong>${formatMoney(product.price_cents)}</strong></div>
        <div><span>Store</span><strong>${config.label}</strong></div>
        <div><span>Availability</span><strong>${product.stock} in stock</strong></div>
      </div>
      <p class="detail-copy">${product.details}</p>
      <div class="quantity-select">
        <label class="field">
          <span>Quantity</span>
          <input id="detailQuantity" type="number" min="1" max="${Math.min(20, product.stock)}" value="1">
        </label>
        <button class="primary-button" type="button" data-add="${product.id}">Add to cart</button>
      </div>
    </div>
  `;
}

async function initProductPage() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const detail = $("#productDetail");
  if (!slug) {
    detail.innerHTML = emptyMarkup("Product not found.", "Return to products and choose an item.");
    return;
  }

  try {
    const { product } = await api(`/api/products/${encodeURIComponent(slug)}`);
    state.currentProduct = product;
    renderProductDetail(product);
  } catch (error) {
    detail.innerHTML = emptyMarkup("Product not found.", "Return to products and choose an item.");
  }
}

function checkoutTotals(cart) {
  const config = regionConfig();
  const subtotal = cart.subtotal_cents || 0;
  const shipping = subtotal >= config.freeShippingThresholdCents || subtotal === 0 ? 0 : config.shippingCents;
  const tax = Math.round(subtotal * config.taxRate);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

function renderCheckout() {
  const container = $("#checkoutItems");
  if (!container) return;

  if (!state.user) {
    container.innerHTML = emptyMarkup("Sign in required.", "Use the account button to continue checkout.");
    return;
  }

  if (!state.cart.items.length) {
    container.innerHTML = emptyMarkup("Your cart is empty.", "Add products before checkout.");
  } else {
    container.innerHTML = state.cart.items.map((item) => `
      <article class="checkout-item">
        <img src="${item.image_url}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <span>${item.quantity} x ${formatMoney(item.price_cents)}</span>
        </div>
        <strong class="price">${formatMoney(item.line_total_cents)}</strong>
      </article>
    `).join("");
  }

  const totals = checkoutTotals(state.cart);
  $("#summarySubtotal").textContent = formatMoney(totals.subtotal);
  $("#summaryShipping").textContent = totals.shipping ? formatMoney(totals.shipping) : "Free";
  $("#summaryTax").textContent = formatMoney(totals.tax);
  $("#summaryTotal").textContent = formatMoney(totals.total);

  const emailInput = $("#checkoutForm input[name='email']");
  const nameInput = $("#checkoutForm input[name='fullName']");
  if (state.user && emailInput && !emailInput.value) emailInput.value = state.user.email;
  if (state.user && nameInput && !nameInput.value) nameInput.value = state.user.name;
}

async function initCheckout() {
  renderCheckout();
  $("#checkoutForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#checkoutMessage", "");

    if (!state.user) {
      openAuth("login");
      return;
    }
    if (!state.cart.items.length) {
      setMessage("#checkoutMessage", "Your cart is empty.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      region: state.region
    };
    try {
      const data = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      state.cart = { items: [], subtotal_cents: 0, item_count: 0 };
      updateHeader();
      renderCheckout();
      event.currentTarget.reset();
      setMessage("#checkoutMessage", `Order ${data.order.id.slice(0, 8)} placed for ${formatMoney(data.order.total_cents, data.order.region || state.region)}.`);
      showToast("Order placed");
    } catch (error) {
      setMessage("#checkoutMessage", error.message);
    }
  });
}

async function renderOrders() {
  const list = $("#ordersList");
  if (!state.user) {
    openAuth("login");
    return;
  }

  list.innerHTML = emptyMarkup("Loading orders...", "");
  $("#ordersModal")?.showModal();

  try {
    const { orders } = await api("/api/orders");
    list.innerHTML = orders.length ? orders.map((order) => `
      <article class="order-card">
        <div class="order-meta">
          <span>${new Date(order.created_at).toLocaleString()}</span>
          <strong>${formatMoney(order.total_cents, order.region || state.region)}</strong>
        </div>
        <h3>Order ${order.id.slice(0, 8)}</h3>
        <p>${regionConfig(order.region || state.region).label} store</p>
        <p>${order.items.map((item) => `${item.quantity} x ${item.product_name}`).join(", ")}</p>
      </article>
    `).join("") : emptyMarkup("No orders yet.", "Completed checkout orders will appear here.");
  } catch (error) {
    list.innerHTML = emptyMarkup("Orders unavailable.", error.message);
  }
}

async function signInWithProvider(provider) {
  const providerLabel = SOCIAL_PROVIDERS[provider];
  if (!providerLabel) return;

  setMessage("#authMessage", "");

  const width = 500;
  const height = 650;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  window.open(
    `/auth/${provider}`,
    "auth_popup",
    `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
  );
}

function bindGlobalEvents() {
  document.querySelectorAll("[data-region]").forEach((button) => {
    button.addEventListener("click", () => setRegion(button.dataset.region));
  });

  document.querySelectorAll("[data-provider]").forEach((button) => {
    button.addEventListener("click", () => signInWithProvider(button.dataset.provider));
  });

  $("#authButton")?.addEventListener("click", () => openAuth("login"));
  $("#closeAuthButton")?.addEventListener("click", () => $("#authModal")?.close());
  $("#loginTab")?.addEventListener("click", () => {
    state.authMode = "login";
    renderAuthMode();
  });
  $("#registerTab")?.addEventListener("click", () => {
    state.authMode = "register";
    renderAuthMode();
  });

  $("#logoutButton")?.addEventListener("click", async () => {
    await api("/api/logout", { method: "POST" });
    state.user = null;
    state.cart = { items: [], subtotal_cents: 0, item_count: 0 };
    updateHeader();
    renderCart();
    if (document.body.dataset.page === "checkout") renderCheckout();
    showToast("Signed out");
  });

  $("#authForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const endpoint = state.authMode === "register" ? "/api/register" : "/api/login";
    setMessage("#authMessage", "");

    try {
      const data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      state.user = data.user;
      form.reset();
      $("#authModal")?.close();
      await loadCart();
      if (document.body.dataset.page === "checkout") renderCheckout();
      showToast(state.authMode === "register" ? "Account created" : "Signed in");
    } catch (error) {
      setMessage("#authMessage", error.message);
    }
  });

  $("#cartButton")?.addEventListener("click", openCart);
  $("#closeCartButton")?.addEventListener("click", closeCart);
  $("#cartDrawer")?.addEventListener("click", (event) => {
    if (event.target.id === "cartDrawer") closeCart();
  });

  $("#cartItems")?.addEventListener("click", async (event) => {
    const quantityButton = event.target.closest("[data-qty]");
    const removeButton = event.target.closest("[data-remove]");

    if (quantityButton) {
      const productId = Number(quantityButton.dataset.product);
      const quantity = Number(quantityButton.dataset.qty);
      const data = await api(`/api/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity })
      });
      state.cart = data.cart;
      updateHeader();
      renderCart();
      if (document.body.dataset.page === "checkout") renderCheckout();
    }

    if (removeButton) {
      const productId = Number(removeButton.dataset.remove);
      const data = await api(`/api/cart/items/${productId}`, { method: "DELETE" });
      state.cart = data.cart;
      updateHeader();
      renderCart();
      if (document.body.dataset.page === "checkout") renderCheckout();
    }
  });

  document.body.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (!addButton) return;
    const quantityInput = $("#detailQuantity");
    const quantity = quantityInput ? Number(quantityInput.value || 1) : 1;
    addToCart(Number(addButton.dataset.add), quantity);
  });

  $("#ordersButton")?.addEventListener("click", renderOrders);
  $("#closeOrdersButton")?.addEventListener("click", () => $("#ordersModal")?.close());
}

async function boot() {
  bindGlobalEvents();
  applyRegionChrome();
  renderAuthMode();
  await loadMe();
  await loadCart();

  window.addEventListener("message", async (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "auth_success") {
      await loadMe();
      await loadCart();
      $("#authModal")?.close();
      if (document.body.dataset.page === "checkout") renderCheckout();
      showToast("Signed in successfully!");
    }
  });

  const page = document.body.dataset.page;
  if (page === "home") await initHome();
  if (page === "product") await initProductPage();
  if (page === "checkout") await initCheckout();
}

boot().catch((error) => {
  console.error(error);
  showToast("Unable to load the shop");
});
