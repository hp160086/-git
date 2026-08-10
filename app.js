const products = [
  { id: 1, name: "红富士苹果", meta: "约500g · 脆甜多汁", price: 4.98, emoji: "🍎", tone: "red", category: "新鲜蔬菜" },
  { id: 2, name: "光明优倍鲜牛奶", meta: "950ml · 冷藏", price: 15.5, emoji: "🥛", tone: "blue", category: "乳品烘焙" },
  { id: 3, name: "山东黄瓜", meta: "约500g · 清脆爽口", price: 2.98, emoji: "🥒", tone: "green", category: "新鲜蔬菜" },
  { id: 4, name: "西红柿", meta: "约500g · 当日新鲜", price: 3.28, emoji: "🍅", tone: "red", category: "新鲜蔬菜" },
  { id: 5, name: "土豆", meta: "约500g · 家常必备", price: 1.68, emoji: "🥔", tone: "orange", category: "新鲜蔬菜" },
  { id: 6, name: "玉米", meta: "约450g · 香甜软糯", price: 2.68, emoji: "🌽", tone: "orange", category: "新鲜蔬菜" },
  { id: 7, name: "可口可乐", meta: "330ml · 罐装", price: 3, emoji: "🥤", tone: "red", category: "酒水饮料" },
  { id: 8, name: "薯片分享装", meta: "70g · 原味", price: 6.9, emoji: "🍟", tone: "orange", category: "休闲零食" }
];

const categories = [
  ["🥬", "新鲜蔬菜"], ["🍊", "时令水果"], ["🥩", "肉蛋熟食"], ["🥛", "乳品烘焙"], ["🥤", "酒水饮料"],
  ["🫙", "粮油调味"], ["🍟", "休闲零食"], ["🧴", "日用百货"], ["🧼", "纸品清洁"], ["▦", "全部分类"]
];

const state = {
  page: "home",
  category: "新鲜蔬菜",
  selectedProduct: products[0],
  selectedPayment: "wechat",
  cart: JSON.parse(localStorage.getItem("neighbor-cart") || "{}"),
  orderTab: "全部",
  orders: [
    { no: "20240518001", status: "待接单", total: 23.46, items: ["🍎", "🥛", "🥒"] },
    { no: "20240517028", status: "配送中", total: 7.86, items: ["🍅", "🥬"] },
    { no: "20240516015", status: "已送达", total: 18.5, items: ["🥛", "🍟", "🥔"] }
  ]
};

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

const icons = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s7-6.1 7-13a7 7 0 1 0-14 0c0 6.9 7 13 7 13Zm0-10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h2l2 11h9l2-8H7"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>',
  order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 4 4L19 6"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>'
};

function money(value) { return `¥${value.toFixed(2)}`; }
function cartCount() { return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0); }
function cartItems() { return Object.entries(state.cart).map(([id, qty]) => ({ product: products.find(p => p.id === Number(id)), qty })).filter(item => item.product); }
function cartTotal() { return cartItems().reduce((sum, item) => sum + item.product.price * item.qty, 0); }
function deliveryFee(total = cartTotal()) { return total >= 35 ? 0 : 5; }
function persistCart() { localStorage.setItem("neighbor-cart", JSON.stringify(state.cart)); }

function productArt(product, extra = "") { return `<div class="product-art ${product.tone || ""} ${extra}" aria-hidden="true">${product.emoji}</div>`; }

function nav(current) {
  const items = [["home", icons.home, "首页"], ["category", icons.grid, "分类"], ["cart", icons.cart, "购物车"], ["orders", icons.order, "订单"], ["profile", icons.user, "我的"]];
  return `<nav class="bottom-nav" aria-label="主导航">${items.map(([page, icon, label]) => `<button class="nav-item ${current === page ? "active" : ""}" data-page="${page}">${icon}<span>${label}</span>${page === "cart" && cartCount() ? `<b class="nav-badge">${cartCount()}</b>` : ""}</button>`).join("")}</nav>`;
}

function topbar(title, back = false) {
  return `<header class="topbar compact">${back ? `<button class="back-btn" data-page="${state.page === "detail" ? "category" : "cart"}">${icons.back}<span>返回</span></button>` : `<div><div class="eyebrow">社区便利 · 店员配送</div><div class="brand">乐享<span>便利店</span></div></div>`}<strong>${title}</strong><div class="mini-actions"><button class="icon-btn" aria-label="更多">•••</button><button class="icon-btn" aria-label="小程序菜单">◉</button></div></header>`;
}

function searchBox(placeholder = "搜一搜你想买的商品") {
  return `<label class="search">${icons.search}<input placeholder="${placeholder}" /><button data-search>搜索</button></label>`;
}

function homePage() {
  return `<section class="screen"><header class="topbar home-topbar"><div class="brand-row"><div><div class="brand home-brand">乐享<span>便利店</span></div><div class="eyebrow">欢迎回来，今天也要好好生活</div><div class="location">${icons.pin} 赤水本地 · 邻里超市</div></div><div class="mini-actions"><button class="icon-btn" aria-label="更多">•••</button><button class="icon-btn" aria-label="小程序菜单">◉</button></div></div>${searchBox()}</header><div class="content"><div class="hero has-waterfall"><div class="hero-copy"><div class="hero-kicker">赤水竹瀑 · 清爽邻里</div><h1>赤水的鲜味<br/>送到家门口</h1><p>店员配送，仅限本小区<br/>满35元免配送费</p><button class="hero-action" data-page="category">去逛逛 ${icons.arrow}</button></div></div><div class="service-strip"><div class="service-left">${icons.truck}<span>店员配送 · 本小区内</span></div><div class="service-right">满35元免配送费</div></div><section class="section"><div class="section-head"><h2 class="section-title">常买分类</h2><button class="section-link" data-page="category">全部分类 ${icons.arrow}</button></div><div class="category-grid">${categories.map(([emoji, name]) => `<button class="category-item" data-category="${name}"><span class="category-icon">${emoji}</span><span>${name}</span></button>`).join("")}</div></section><section class="section"><div class="section-head"><h2 class="section-title">精选推荐</h2><button class="section-link" data-page="category">更多 ${icons.arrow}</button></div><div class="product-grid">${products.slice(0, 4).map(productCard).join("")}</div></section></div>${nav("home")}</section>`;
}

function productCard(product) {
  return `<article class="product-card"><button class="open-product" data-product="${product.id}" aria-label="查看${product.name}">${productArt(product)}</button><button class="open-product product-name" data-product="${product.id}">${product.name}</button><div class="product-meta">${product.meta}</div><div class="product-foot"><span class="price"><small>¥</small>${product.price.toFixed(2)}</span><button class="add-btn" data-add="${product.id}" aria-label="加入购物车">+</button></div></article>`;
}

function categoryPage() {
  const list = products.filter(p => state.category === "全部分类" || p.category === state.category || (state.category === "时令水果" && p.name.includes("苹果")) || (state.category === "乳品烘焙" && p.name.includes("牛奶")) || (state.category === "酒水饮料" && p.name.includes("可乐")) || (state.category === "休闲零食" && p.name.includes("薯片")));
  const visible = list.length ? list : products;
  return `<section class="screen">${topbar("分类")}<div class="content">${searchBox("搜索商品")}<div class="category-layout section"><aside class="category-rail">${categories.slice(0, 9).map(([, name]) => `<button class="rail-item ${state.category === name ? "active" : ""}" data-category="${name}">${name}</button>`).join("")}</aside><div class="category-products">${visible.map(listProduct).join("")}</div></div></div>${nav("category")}</section>`;
}

function listProduct(product) {
  return `<article class="list-product"><button class="open-product" data-product="${product.id}" aria-label="查看${product.name}">${productArt(product)}</button><div><button class="open-product product-name" data-product="${product.id}">${product.name}</button><div class="product-meta">${product.meta}</div><div class="product-foot"><span class="price"><small>¥</small>${product.price.toFixed(2)}</span><span class="product-meta">有货</span></div></div><button class="add-btn" data-add="${product.id}" aria-label="加入购物车">+</button></article>`;
}

function detailPage() {
  const p = state.selectedProduct;
  return `<section class="screen">${topbar("", true)}<div class="content"><div class="detail-photo ${p.tone}">${p.emoji}<span class="counter">1 / 4</span></div><h1 class="detail-title">${p.name} <small>${p.meta.split("·")[0]}</small></h1><div class="detail-sub">脆甜多汁｜新鲜采摘｜今日可送</div><div class="detail-price">${money(p.price)}</div><div class="detail-section"><div class="detail-label">选择规格</div><div class="option-row"><button class="option">${p.meta.split("·")[0].trim()}</button><div class="qty-control"><button data-detail-minus>−</button><strong>1</strong><button data-detail-plus>＋</button></div></div></div><div class="detail-note">${icons.truck}<span>店员配送，仅限本小区配送</span></div><div class="detail-note"><span>✓</span><span>满35元免配送费，未满35元配送费5元</span></div></div><div class="detail-actions"><button class="secondary-btn" data-add="${p.id}">加入购物车</button><button class="primary-btn" data-page="cart">立即购买</button></div>${nav("")}</section>`;
}

function cartPage() {
  const items = cartItems();
  const total = cartTotal();
  const fee = deliveryFee(total);
  return `<section class="screen">${topbar("购物车")}<div class="content"><div class="notice">店员配送 · 仅限赤水本小区 · ${total >= 35 ? "已免配送费" : `还差${Math.max(0, 35 - total).toFixed(2)}元免配送费`}</div>${items.length ? `<div class="cart-list">${items.map(cartItem).join("")}</div><div class="cart-summary"><div class="summary-row"><span>商品小计</span><span>${money(total)}</span></div><div class="summary-row"><span>店员配送费</span><span>${fee ? money(fee) : "免费"}</span></div><div class="summary-row total"><span>合计</span><strong>${money(total + fee)}</strong></div><button class="primary-btn" style="width:100%;margin-top:16px" data-page="checkout">去结算</button></div>` : `<div class="empty">购物车还是空的<br/><button class="secondary-btn" style="margin-top:15px;padding:9px 16px" data-page="category">去逛逛</button></div>`}</div>${nav("cart")}</section>`;
}

function cartItem({ product, qty }) {
  return `<article class="cart-item"><button class="check" aria-label="已选中">${icons.check}</button>${productArt(product)}<div><div class="product-name">${product.name}</div><div class="product-meta">${product.meta}</div><div class="product-foot"><span class="price"><small>¥</small>${product.price.toFixed(2)}</span></div></div><div class="cart-side"><span class="price">${money(product.price * qty)}</span><div class="qty-control"><button data-minus="${product.id}">−</button><strong>${qty}</strong><button data-plus="${product.id}">＋</button></div></div></article>`;
}

function checkoutPage() {
  const total = cartTotal();
  const fee = deliveryFee(total);
  return `<section class="screen">${topbar("确认订单", true)}<div class="content"><section class="section"><div class="section-head"><h2 class="section-title">收货信息</h2><button class="section-link">更换地址 ${icons.arrow}</button></div><div class="address-card">${icons.pin}<div><div class="address-main">张先生 · 138 1234 5678</div><div class="address-sub">赤水市 · 竹海小区 3号楼 5单元101</div></div></div></section><section class="section"><div class="section-head"><h2 class="section-title">配送方式</h2><span class="green-text">店员配送</span></div><div class="notice">仅配送店铺所在小区，营业时间内尽快送达</div></section><section class="section"><h2 class="section-title">支付方式</h2><div class="pay-options"><button class="pay-option ${state.selectedPayment === "wechat" ? "selected" : ""}" data-payment="wechat"><span class="pay-option-label"><i class="pay-icon">☘</i>微信支付</span><i class="radio"></i></button><button class="pay-option cash ${state.selectedPayment === "cash" ? "selected" : ""}" data-payment="cash"><span class="pay-option-label"><i class="pay-icon">¥</i>货到付款</span><i class="radio"></i></button></div></section><section class="section"><h2 class="section-title">订单备注</h2><textarea class="remark" placeholder="如放门口、不要辣、联系不上时怎么处理"></textarea></section><div class="cart-summary" style="margin-top:22px"><div class="summary-row"><span>商品小计</span><span>${money(total)}</span></div><div class="summary-row"><span>店员配送费</span><span>${fee ? money(fee) : "免费"}</span></div><div class="summary-row total"><span>应付合计</span><strong>${money(total + fee)}</strong></div></div></div><div class="checkout-foot"><div class="checkout-total">应付合计<strong>${money(total + fee)}</strong></div><button class="primary-btn" data-submit-order>提交订单</button></div></section>`;
}

function ordersPage() {
  const tabs = ["全部", "待接单", "配送中", "已送达"];
  const filtered = state.orderTab === "全部" ? state.orders : state.orders.filter(o => o.status === state.orderTab);
  return `<section class="screen">${topbar("我的订单")}<div class="content"><div class="tabs">${tabs.map(tab => `<button class="tab ${state.orderTab === tab ? "active" : ""}" data-order-tab="${tab}">${tab}</button>`).join("")}</div><div class="order-list">${filtered.length ? filtered.map(orderCard).join("") : `<div class="empty">这里还没有订单</div>`}</div></div>${nav("orders")}</section>`;
}

function orderCard(order) {
  return `<article class="order-card"><div class="order-head"><span>订单号 ${order.no}</span><span class="order-status">${order.status}</span></div><div class="order-items">${order.items.map(emoji => `<span class="order-mini-art">${emoji}</span>`).join("")}</div><div class="order-foot"><span class="order-total">共${order.items.length}件商品 · 合计 <strong>${money(order.total)}</strong></span><button class="small-btn">${order.status === "已送达" ? "再来一单" : "查看详情"}</button></div></article>`;
}

function profilePage() {
  const orderShortcuts = [["待接单", "⌛"], ["配送中", "🚲"], ["已送达", "✓"], ["全部订单", "▤"]];
  return `<section class="screen">${topbar("我的")}<div class="content profile-content"><section class="profile-hero"><div class="avatar">😊</div><div class="profile-copy"><div class="profile-name">欢迎来到乐享便利店</div><div class="profile-hint">登录微信后，可查看订单和收货地址</div><div class="profile-location">赤水本地 · 邻里好生活</div></div><button class="profile-arrow" aria-label="个人资料">${icons.arrow}</button></section><section class="profile-section"><div class="profile-section-head"><h2 class="section-title">我的订单</h2><button class="section-link" data-page="orders">全部订单 ${icons.arrow}</button></div><div class="order-status-grid">${orderShortcuts.map(([label, symbol]) => `<button class="order-status-item" data-page="orders"><span class="status-icon">${symbol}</span><span>${label}</span></button>`).join("")}</div></section><section class="profile-section profile-list"><button class="setting"><span><i class="setting-icon">⌂</i>收货地址</span>${icons.arrow}</button><button class="setting"><span><i class="setting-icon">☏</i>联系客服</span>${icons.arrow}</button><button class="setting"><span><i class="setting-icon">♧</i>关于乐享便利店</span>${icons.arrow}</button></section></div>${nav("profile")}</section>`;
}

function render() {
  const page = { home: homePage, category: categoryPage, detail: detailPage, cart: cartPage, checkout: checkoutPage, orders: ordersPage, profile: profilePage }[state.page] || homePage;
  app.innerHTML = page();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  persistCart();
  render();
  showToast("已加入购物车");
}

function changeQty(id, delta) {
  state.cart[id] = (state.cart[id] || 0) + delta;
  if (state.cart[id] <= 0) delete state.cart[id];
  persistCart();
  render();
}

app.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  const categoryButton = event.target.closest("[data-category]");
  const productButton = event.target.closest("[data-product]");
  const addButton = event.target.closest("[data-add]");
  const plusButton = event.target.closest("[data-plus]");
  const minusButton = event.target.closest("[data-minus]");
  const payButton = event.target.closest("[data-payment]");
  const tabButton = event.target.closest("[data-order-tab]");

  if (pageButton) { state.page = pageButton.dataset.page; render(); return; }
  if (categoryButton) { state.category = categoryButton.dataset.category; state.page = "category"; render(); return; }
  if (productButton) { state.selectedProduct = products.find(product => product.id === Number(productButton.dataset.product)); state.page = "detail"; render(); return; }
  if (addButton) { addToCart(Number(addButton.dataset.add)); return; }
  if (plusButton) { changeQty(Number(plusButton.dataset.plus), 1); return; }
  if (minusButton) { changeQty(Number(minusButton.dataset.minus), -1); return; }
  if (payButton) { state.selectedPayment = payButton.dataset.payment; render(); return; }
  if (tabButton) { state.orderTab = tabButton.dataset.orderTab; render(); return; }
  if (event.target.closest("[data-detail-plus]")) { showToast("规格数量已增加（演示）"); return; }
  if (event.target.closest("[data-detail-minus]")) { showToast("规格数量已减少（演示）"); return; }
  if (event.target.closest("[data-search]")) { showToast("搜索功能将在下一版接入"); return; }
  if (event.target.closest("[data-submit-order]")) {
    const total = cartTotal() + deliveryFee();
    state.orders.unshift({ no: String(Date.now()).slice(-11), status: "待接单", total, items: cartItems().map(item => item.product.emoji) });
    state.cart = {};
    persistCart();
    state.page = "orders";
    render();
    showToast(state.selectedPayment === "wechat" ? "演示支付成功，订单已提交" : "订单已提交，配送时付款");
  }
});

render();
