document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Merch cart (saved in the visitor's browser)
(function () {
  var KEY = 'ay_cart_v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function money(n) { return '$' + n.toFixed(2); }
  var cart = load();

  // Cart button in the header (added on every page)
  var headerInner = document.querySelector('.header-inner');
  var cartBtn = document.createElement('button');
  cartBtn.type = 'button';
  cartBtn.className = 'cart-btn';
  cartBtn.setAttribute('aria-label', 'Open cart');
  cartBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="cart-count">0</span>';
  if (headerInner) headerInner.insertBefore(cartBtn, document.querySelector('.nav-toggle'));

  // Slide-out drawer
  var overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  var drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-label', 'Shopping cart');
  drawer.innerHTML =
    '<div class="cart-head"><h3>Your Cart</h3><button type="button" class="cart-close" aria-label="Close cart">&times;</button></div>' +
    '<div class="cart-items"></div>' +
    '<div class="cart-foot">' +
      '<div class="cart-subtotal"><span>Subtotal</span><strong class="cart-total">$0.00</strong></div>' +
      '<button type="button" class="btn btn-primary cart-checkout">Checkout</button>' +
      '<p class="cart-note" hidden>[PLACEHOLDER] Online checkout is coming soon. <a href="contact.html">Contact me</a> to place an order.</p>' +
    '</div>';
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  var itemsEl = drawer.querySelector('.cart-items');
  var totalEl = drawer.querySelector('.cart-total');
  var checkoutBtn = drawer.querySelector('.cart-checkout');
  var noteEl = drawer.querySelector('.cart-note');

  function openCart() { document.body.classList.add('cart-open'); }
  function closeCart() { document.body.classList.remove('cart-open'); }
  cartBtn.addEventListener('click', openCart);
  overlay.addEventListener('click', closeCart);
  drawer.querySelector('.cart-close').addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });
  checkoutBtn.addEventListener('click', function () { if (cart.length) noteEl.hidden = false; });

  function render() {
    var count = 0, total = 0;
    cart.forEach(function (item) { count += item.qty; total += item.qty * item.price; });
    cartBtn.querySelector('.cart-count').textContent = count;
    cartBtn.classList.toggle('has-items', count > 0);
    totalEl.textContent = money(total);
    checkoutBtn.disabled = cart.length === 0;

    if (!cart.length) {
      itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      noteEl.hidden = true;
      return;
    }

    itemsEl.innerHTML = '';
    cart.forEach(function (item, idx) {
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<div class="cart-item-info"><strong></strong><span class="cart-item-meta"></span></div>' +
        '<div class="cart-qty"><button type="button" data-step="-1" aria-label="Decrease quantity">&minus;</button><span></span><button type="button" data-step="1" aria-label="Increase quantity">+</button></div>' +
        '<span class="cart-line"></span>' +
        '<button type="button" class="cart-remove" aria-label="Remove item">&times;</button>';
      row.querySelector('strong').textContent = item.name;
      row.querySelector('.cart-item-meta').textContent = (item.size ? 'Size ' + item.size + ' · ' : '') + money(item.price);
      row.querySelector('.cart-qty span').textContent = item.qty;
      row.querySelector('.cart-line').textContent = money(item.qty * item.price);
      row.querySelectorAll('.cart-qty button').forEach(function (b) {
        b.addEventListener('click', function () {
          item.qty += Number(b.dataset.step);
          if (item.qty < 1) cart.splice(idx, 1);
          save(); render();
        });
      });
      row.querySelector('.cart-remove').addEventListener('click', function () {
        cart.splice(idx, 1);
        save(); render();
      });
      itemsEl.appendChild(row);
    });
  }

  // Add to Cart buttons on merch cards
  document.querySelectorAll('.add-to-cart').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = b.closest('.merch-card');
      var sizeSel = card && card.querySelector('.merch-size');
      var size = sizeSel ? sizeSel.value : '';
      var id = b.dataset.id + (size ? '-' + size : '');
      var existing = cart.filter(function (i) { return i.id === id; })[0];
      if (existing) existing.qty += 1;
      else cart.push({ id: id, name: b.dataset.name, price: parseFloat(b.dataset.price), size: size, qty: 1 });
      save(); render();
      b.textContent = 'Added ✓';
      setTimeout(function () { b.textContent = 'Add to Cart'; }, 1200);
      cartBtn.classList.remove('bump');
      void cartBtn.offsetWidth;
      cartBtn.classList.add('bump');
    });
  });

  render();
})();
