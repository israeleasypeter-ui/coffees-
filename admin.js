(function () {
  const PRODUCTS_KEY = "emberOakAdminProducts";
  const ORDERS_KEY = "emberOakAdminOrders";
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  let products = read(PRODUCTS_KEY);
  let orders = read(ORDERS_KEY);

  const style = document.createElement("style");
  style.textContent = `
    .coffee-admin-launch{position:fixed;right:18px;bottom:18px;z-index:1000;border:0;border-radius:999px;background:#2B1A12;color:#FFF8F0;padding:13px 19px;font:700 14px/1.2 system-ui;box-shadow:0 8px 28px #2B1A1240;cursor:pointer}
    .coffee-admin-panel{position:fixed;right:18px;bottom:76px;z-index:1001;width:min(390px,calc(100vw - 36px));max-height:min(78vh,700px);overflow:auto;background:#FFF8F0;color:#2B1A12;border:1px solid #eadbc8;border-radius:22px;padding:20px;box-shadow:0 18px 60px #1b100c45;font:14px/1.45 system-ui;display:none}
    .coffee-admin-panel.open{display:block}.coffee-admin-panel h2,.coffee-admin-panel h3{margin:0 0 10px}.coffee-admin-panel h2{font-family:Georgia,serif;font-size:25px}.coffee-admin-panel h3{font-size:15px;margin-top:22px}
    .coffee-admin-panel label{display:block;font-weight:650;margin:12px 0 5px}.coffee-admin-panel input{width:100%;box-sizing:border-box;border:1px solid #d9c8b7;border-radius:10px;padding:10px;background:white;color:#2B1A12;font:inherit}
    .coffee-admin-panel button{border:0;border-radius:999px;background:#2B1A12;color:white;padding:10px 15px;font:700 13px system-ui;cursor:pointer}.coffee-admin-panel .admin-submit{background:#C08A3E;margin-top:14px}.coffee-admin-note{font-size:12px;color:#786555;margin:8px 0}.coffee-admin-item{display:flex;gap:10px;align-items:center;padding:10px 0;border-top:1px solid #eadbc8}.coffee-admin-item img{width:54px;height:54px;object-fit:cover;border-radius:12px;background:#eadbc8}.coffee-admin-item div{flex:1;min-width:0}.coffee-admin-item strong{display:block}.coffee-admin-item small{color:#786555}.coffee-admin-item button{padding:8px 11px;font-size:12px}.coffee-admin-products{max-width:1200px;margin:20px auto;padding:24px;background:#fff8f0;border-radius:24px}.coffee-admin-products h2{font:600 28px Georgia,serif;color:#2b1a12;margin:0 0 16px}.coffee-admin-product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}.coffee-admin-product{overflow:hidden;border-radius:20px;background:white;box-shadow:0 8px 26px #2b1a1212;color:#2b1a12}.coffee-admin-product img{width:100%;height:180px;object-fit:cover;background:#f2e5d7}.coffee-admin-product-body{padding:16px}.coffee-admin-product-body h3{font:600 21px Georgia,serif;margin:0 0 8px}.coffee-admin-product-body p{margin:0 0 12px;color:#6f5b4d;font-size:14px}.coffee-admin-product-body button{border:0;border-radius:999px;background:#2b1a12;color:white;padding:10px 15px;font-weight:700;cursor:pointer}
    @media(max-width:600px){.coffee-admin-launch{right:12px;bottom:12px}.coffee-admin-panel{right:12px;bottom:68px;width:calc(100vw - 24px);padding:16px}.coffee-admin-products{margin:12px;padding:18px}}
  `;
  document.head.appendChild(style);

  const launch = document.createElement("button");
  launch.type = "button"; launch.className = "coffee-admin-launch"; launch.textContent = "Admin";
  launch.setAttribute("aria-expanded", "false");
  const panel = document.createElement("aside");
  panel.className = "coffee-admin-panel"; panel.setAttribute("aria-label", "Coffee shop admin");
  panel.innerHTML = `<h2>Shop admin</h2><p class="coffee-admin-note">Add menu items with an image and price. Orders are saved in this browser.</p>
    <form id="coffee-admin-form"><label for="coffee-admin-name">Item name</label><input id="coffee-admin-name" name="name" required maxlength="60" placeholder="Vanilla oat latte">
    <label for="coffee-admin-price">Price (USD)</label><input id="coffee-admin-price" name="price" type="number" min="0.01" step="0.01" required placeholder="5.50">
    <label for="coffee-admin-image">Product image</label><input id="coffee-admin-image" name="image" type="file" accept="image/*" required>
    <button class="admin-submit" type="submit">Add item to menu</button></form>
    <h3>Recent orders</h3><div id="coffee-admin-orders"></div>`;
  document.body.append(launch, panel);

  const productSection = document.createElement("section");
  productSection.className = "coffee-admin-products";
  productSection.innerHTML = `<h2>New at Ember &amp; Oak</h2><div class="coffee-admin-product-grid"></div>`;
  const grid = productSection.querySelector(".coffee-admin-product-grid");
  const money = (n) => "$" + Number(n).toFixed(2);

  function save() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
  function addOrder(item) {
    orders.unshift({ id: Date.now(), name: item.name, price: item.price, time: new Date().toLocaleString() });
    save(); renderOrders();
  }
  function renderProducts() {
    grid.replaceChildren();
    products.forEach((item) => {
      const card = document.createElement("article"); card.className = "coffee-admin-product";
      const img = document.createElement("img"); img.src = item.image; img.alt = item.name;
      const body = document.createElement("div"); body.className = "coffee-admin-product-body";
      const name = document.createElement("h3"); name.textContent = item.name;
      const price = document.createElement("p"); price.textContent = money(item.price);
      const add = document.createElement("button"); add.type = "button"; add.textContent = "Add to Order"; add.addEventListener("click", () => addOrder(item));
      body.append(name, price, add); card.append(img, body); grid.append(card);
    });
    productSection.hidden = products.length === 0;
  }
  function renderOrders() {
    const list = panel.querySelector("#coffee-admin-orders"); list.replaceChildren();
    if (!orders.length) { const empty = document.createElement("p"); empty.className = "coffee-admin-note"; empty.textContent = "No orders yet. Use Add to Order on a menu item."; list.append(empty); return; }
    orders.slice(0, 20).forEach((order) => {
      const row = document.createElement("div"); row.className = "coffee-admin-item";
      const details = document.createElement("div"); const name = document.createElement("strong"); name.textContent = order.name;
      const meta = document.createElement("small"); meta.textContent = `${money(order.price)} · ${order.time}`;
      const done = document.createElement("button"); done.type = "button"; done.textContent = "Done";
      done.addEventListener("click", () => { orders = orders.filter((entry) => entry.id !== order.id); save(); renderOrders(); });
      details.append(name, meta); row.append(details, done); list.append(row);
    });
  }
  function placeProductSection() {
    const menu = document.querySelector("#menu");
    if (menu && !productSection.isConnected) menu.insertAdjacentElement("afterend", productSection);
  }
  launch.addEventListener("click", () => {
    const open = panel.classList.toggle("open"); launch.setAttribute("aria-expanded", String(open));
  });
  panel.querySelector("#coffee-admin-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget; const file = form.elements.image.files[0];
    if (!file) return;
    const image = await new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onerror = reject;
      reader.onload = () => {
        const source = new Image(); source.onerror = reject;
        source.onload = () => {
          const scale = Math.min(1, 900 / Math.max(source.width, source.height));
          const canvas = document.createElement("canvas"); canvas.width = Math.round(source.width * scale); canvas.height = Math.round(source.height * scale);
          canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/webp", 0.82));
        };
        source.src = reader.result;
      };
      reader.readAsDataURL(file);
    }).catch(() => null);
    if (!image) { alert("That image could not be loaded. Please choose another image."); return; }
    const item = { id: Date.now(), name: form.elements.name.value.trim(), price: Number(form.elements.price.value), image };
    products.push(item);
    try { save(); }
    catch { products.pop(); alert("Browser storage is full. Try a smaller image."); return; }
    renderProducts(); form.reset();
  });
  renderProducts(); renderOrders(); placeProductSection();
  new MutationObserver(placeProductSection).observe(document.body, { childList: true, subtree: true });
})();
