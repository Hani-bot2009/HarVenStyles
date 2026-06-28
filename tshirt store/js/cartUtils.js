/* ================================================================
   HarVenStyles — js/cartUtils.js   (UPDATED — adds placeOrder)
   DROP-IN REPLACEMENT for the previous cartUtils.js.

   Strategy:
   • Logged-in + backend online  → MongoDB via /api/cart + /api/orders
   • Logged-out OR backend down  → localStorage fallback
   Both return the same data shape so callers need zero changes.
================================================================ */

const HVCart = (function () {
  'use strict';

  var API_BASE = 'http://192.168.31.65:5000/api';
  var SESSION_KEY = 'hv_session';
  var CART_KEY    = 'hv_cart';

  /* ── Session ─────────────────────────────────────────────────── */
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch(e) { return null; }
  }
  function authHeaders() {
    var s = getSession();
    var h = { 'Content-Type': 'application/json' };
    if (s && s.token) h['Authorization'] = 'Bearer ' + s.token;
    return h;
  }
  function isLoggedIn() {
    var s = getSession();
    return !!(s && s.token);
  }

  /* ── localStorage cart helpers ───────────────────────────────── */
  function localGet() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e) { return []; }
  }
  function localSave(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch(e) {}
  }
  function localTotal(items) {
    return items.reduce(function(sum, i) {
      return sum + (parseFloat(String(i.price).replace(/[^\d.]/g,'')) || 0) * (i.quantity || 1);
    }, 0);
  }

 

  /* ── fetchCart ───────────────────────────────────────────────── */
  async function fetchCart() {
    if (isLoggedIn()) {

      console.log("SESSION:", getSession());
      console.log("HEADERS:", authHeaders());

      try {
        var res = await fetch(API_BASE + '/cart', { headers: authHeaders() });
        if (!res.ok) throw new Error('cart fetch failed');
        return await res.json();
      } catch(e) { /* fallthrough */ }
    }
    var items = localGet();
    return { items: items, total: localTotal(items) };
  }

  /* ── addItem ─────────────────────────────────────────────────── */
  async function addItem(item) {
    if (isLoggedIn()) {
      try {
        var res = await fetch(API_BASE + '/cart', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ productId: item.productId, size: item.size || '', quantity: item.quantity || 1 }),
        });
        if (!res.ok) throw new Error('add failed');
        return await res.json();
      } catch(e) { /* fallthrough */ }
    }
    var items = localGet();
    var idx = items.findIndex(function(x) {
      return x.productId === item.productId && x.size === item.size;
    });
    if (idx > -1) {
      items[idx].quantity = (items[idx].quantity || 1) + (item.quantity || 1);
    } else {
      items.push({
        _id: '_local_' + Date.now(),
        productId: item.productId, name: item.name,
        image: item.image || '', price: item.price,
        size: item.size || '', quantity: item.quantity || 1,
      });
    }
    localSave(items);
    return { items: items, total: localTotal(items) };
  }

  /* ── removeItem ──────────────────────────────────────────────── */
  async function removeItem(itemId) {
    if (isLoggedIn() && !String(itemId).startsWith('_local_')) {
      try {
        var res = await fetch(API_BASE + '/cart/' + itemId, {
          method: 'DELETE', headers: authHeaders(),
        });
        if (!res.ok) throw new Error('remove failed');
        return await res.json();
      } catch(e) { /* fallthrough */ }
    }
    var items = localGet().filter(function(x) { return x._id !== itemId; });
    localSave(items);
    return { items: items, total: localTotal(items) };
  }

  /* ── updateQuantity ───────────────────────────────────────────── */
async function updateQuantity(itemId, quantity) {

  if (isLoggedIn() && !String(itemId).startsWith('_local_')) {

    try {

      var res = await fetch(API_BASE + '/cart/' + itemId, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          quantity: quantity
        })
      });

      if (!res.ok) throw new Error('update failed');

      return await res.json();

    } catch (e) {

      console.error(e);

    }

  }

  var items = localGet();

  var item = items.find(function(x) {
    return x._id === itemId;
  });

  if (item) {
    item.quantity = quantity;
  }

  localSave(items);

  return {
    items: items,
    total: localTotal(items)
  };

}

  /* ── clearCart ───────────────────────────────────────────────── */

  async function clearCart() {
    if (isLoggedIn()) {
      try {
        var res = await fetch(API_BASE + '/cart', { method: 'DELETE', headers: authHeaders() });
        if (!res.ok) throw new Error('clear failed');
      } catch(e) { /* fallthrough */ }
    }
    localSave([]);
    return { items: [], total: 0 };
  }

  


  /* ── placeOrder ──────────────────────────────────────────────── */
  /*  Converts entire cart to an order.
      Returns: { orderId, totalPrice, status, createdAt, items }    */
  async function placeOrder(note) {
    if (isLoggedIn()) {
      try {
        var res = await fetch(API_BASE + '/orders', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ note: note || '' }),
        });
        if (!res.ok) {
          var errData = await res.json();
          throw new Error(errData.message || 'Order placement failed');
        }
        var order = await res.json();
        /* Also clear local cart mirror so UI is consistent */
        localSave([]);
        return order;
      } catch(e) {
        /* Re-throw so cart.html can show the real error message */
        throw e;
      }
      
    }
      throw new Error(
    'Please login before placing an order.'
  );

}

   
  /* ── fetchOrders ─────────────────────────────────────────────── */
  /*  Returns array of order objects, newest first.                 */
  async function fetchOrders() {
    if (isLoggedIn()) {
      try {
        var res = await fetch(API_BASE + '/orders', { headers: authHeaders() });
        if (!res.ok) throw new Error('orders fetch failed');
        return await res.json();   /* array */
      } catch(e) { /* fallthrough */ }
    }
    return [];
  }

  /* ── cartCount ───────────────────────────────────────────────── */
  async function cartCount() {
    var data = await fetchCart();
    return data.items.reduce(function(sum, i) { return sum + (i.quantity || 1); }, 0);
  }

 return {
  addItem,
  fetchCart,
  clearCart,
  removeItem,
  updateQuantity,
  placeOrder,
  fetchOrders
};
}());

if (typeof module !== 'undefined') module.exports = HVCart;