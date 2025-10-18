 // === CONFIG À PERSONNALISER ===
    const BUSINESS_NAME = "Ma Boutique";
    const BUSINESS_PHONE = "221780133945";
    const CURRENCY = "F CFA";
    const PRODUCTS_JSON_URL = "produits.json"; // Chemin vers votre fichier JSON

    // Données produits par défaut (remplacées par le chargement JSON)
    let PRODUCTS = [
      {id:"p1", name:"T-shirt oversize", price:8000, wholesalePrice: 6500, minWholesale: 5, category:"Vêtements", img:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop"},
      {id:"p2", name:"Sneakers", price:25000, wholesalePrice: 21000, minWholesale: 3, category:"Chaussures", img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"},
      {id:"p3", name:"Casquette", price:5000, wholesalePrice: 4000, minWholesale: 10, category:"Accessoires", img:"https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?q=80&w=600&auto=format&fit=crop"},
      {id:"p4", name:"Montre Sport", price:18000, wholesalePrice: 15000, minWholesale: 3, category:"Accessoires", img:"https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop"},
      {id:"p5", name:"Chemise manches longues", price:12000, wholesalePrice: 10000, minWholesale: 5, category:"Vêtements", img:"https://images.unsplash.com/photo-1520975922325-24c36e744a36?q=80&w=600&auto=format&fit=crop"},
      {id:"p6", name:"Sandales", price:9000, wholesalePrice: 7500, minWholesale: 5, category:"Chaussures", img:"https://images.unsplash.com/photo-1596075780750-81249df16d2d?q=80&w=600&auto=format&fit=crop"},
      {id:"p7", name:"Sac à dos", price:14000, wholesalePrice: 12000, minWholesale: 3, category:"Accessoires", img:"https://images.unsplash.com/photo-1542291026-2f6c2e6c5c4a?q=80&w=600&auto=format&fit=crop"},
      {id:"p8", name:"Jean slim", price:15000, wholesalePrice: 12000, minWholesale: 4, category:"Vêtements", img:"https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=600&auto=format&fit=crop"}
    ];

    // === UTIL ===
    const fmt = n => new Intl.NumberFormat('fr-FR').format(n) + ' ' + CURRENCY;

    const state = {
      filter: "Tous",
      query: "",
      saleType: "retail", // 'retail' or 'wholesale'
      cart: JSON.parse(localStorage.getItem('CART') || '{}')
    };

    // Charger les produits depuis le fichier JSON
    async function loadProducts() {
      try {
        const response = await fetch(PRODUCTS_JSON_URL);
        if (response.ok) {
          const products = await response.json();
          PRODUCTS = products;
          renderFilters();
          renderGrid();
        } else {
          console.error("Erreur de chargement des produits, utilisation des données par défaut");
        }
      } catch (error) {
        console.error("Erreur de chargement des produits:", error);
      }
    }

    function saveCart() {
      localStorage.setItem('CART', JSON.stringify(state.cart));
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      toastMessage.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    function getCategories() {
      const cats = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();
      return ["Tous", ...cats];
    }

    function filteredProducts() {
      return PRODUCTS.filter(p => {
        const byCat = state.filter === 'Tous' || p.category === state.filter;
        const byQuery = !state.query || p.name.toLowerCase().includes(state.query);
        return byCat && byQuery;
      });
    }

    function cartCount() {
      return Object.values(state.cart).reduce((a, b) => a + b, 0);
    }

    function cartLines() {
      return Object.entries(state.cart).map(([id, qty]) => {
        const p = PRODUCTS.find(x => x.id === id);
        const price = state.saleType === 'wholesale' && qty >= (p.minWholesale || 0) ? 
                     (p.wholesalePrice || p.price) : p.price;
        return { ...p, qty, price, lineTotal: price * qty };
      });
    }

    function totals() {
      const sub = cartLines().reduce((s, l) => s + l.lineTotal, 0);
      const [mode, shipStr] = document.getElementById('shippingOption').value.split('|');
      const ship = Number(shipStr || 0);
      const grand = sub + ship;
      return { sub, ship, grand };
    }

    function updateBadge() {
      document.getElementById('badge').textContent = cartCount();
      document.getElementById('badge').classList.add('pulse');
      setTimeout(() => document.getElementById('badge').classList.remove('pulse'), 500);
    }

    function renderFilters() {
      const wrap = document.getElementById('filters');
      wrap.innerHTML = '';
      getCategories().forEach(cat => {
        const el = document.createElement('button');
        el.className = 'chip' + (state.filter === cat ? ' active' : '');
        el.textContent = cat;
        el.onclick = () => {
          state.filter = cat;
          renderGrid();
        };
        wrap.appendChild(el);
      });
    }

    function productCard(p) {
      const div = document.createElement('div');
      div.className = 'card';
      
      const isWholesale = state.saleType === 'wholesale';
      const displayPrice = isWholesale ? (p.wholesalePrice || p.price) : p.price;
      
      div.innerHTML = `
        <img class="thumb" src="${p.img}" alt="${p.name}">
        <div class="card-body">
          <div class="cat">${p.category}</div>
          <div class="name">${p.name}</div>
          <div class="price">${fmt(displayPrice)}
            ${isWholesale && p.wholesalePrice ? `<span class="retail-price" style="text-decoration:line-through;font-size:14px;color:var(--text-light);margin-left:8px;">${fmt(p.price)}</span>` : ''}
          </div>
          ${isWholesale && p.minWholesale ? `<div class="wholesale-price">À partir de ${p.minWholesale} pièces</div>` : ''}
          <div class="actions">
            <button class="btn" data-add="${p.id}">
              <i class="fas fa-cart-plus"></i> Ajouter
            </button>
          </div>
        </div>`;
      
      div.querySelector('[data-add]')?.addEventListener('click', () => {
        state.cart[p.id] = (state.cart[p.id] || 0) + 1;
        saveCart();
        updateBadge();
        showToast('Produit ajouté au panier');
      });
      
      return div;
    }

    function renderGrid() {
      const grid = document.getElementById('grid');
      grid.innerHTML = '';
      const products = filteredProducts();
      
      if (products.length === 0) {
        grid.innerHTML = `<div class="empty" style="grid-column:1/-1">Aucun produit trouvé</div>`;
        return;
      }
      
      products.forEach(p => grid.appendChild(productCard(p)));
    }

    function renderCart() {
      const list = document.getElementById('cartItems');
      const empty = document.getElementById('emptyMsg');
      list.innerHTML = '';
      const lines = cartLines();
      
      if (!lines.length) {
        empty.style.display = 'block';
      } else {
        empty.style.display = 'none';
      }
      
      lines.forEach(l => {
        const row = document.createElement('div');
        row.className = 'ci';
        row.innerHTML = `
          <img src="${l.img}" alt="${l.name}">
          <div>
            <div style="font-weight:600">${l.name}</div>
            <div style="font-size:13px;color:var(--text-light)">${fmt(l.price)} / u</div>
            ${l.qty >= (l.minWholesale || Infinity) ? '<div style="font-size:12px;color:var(--success)">Prix gros</div>' : ''}
          </div>
          <div style="text-align:right">
            <div class="q">
              <button class="iconbtn" data-dec="${l.id}">−</button>
              <div style="min-width:30px;text-align:center">${l.qty}</div>
              <button class="iconbtn" data-inc="${l.id}">+</button>
            </div>
            <div style="margin-top:6px;font-weight:700">${fmt(l.lineTotal)}</div>
            <div class="rm" data-rm="${l.id}">Supprimer</div>
          </div>`;
        
        row.querySelector('[data-dec]')?.addEventListener('click', () => {
          if (state.cart[l.id] > 1) {
            state.cart[l.id]--;
          } else {
            delete state.cart[l.id];
          }
          saveCart();
          updateBadge();
          renderCart();
        });
        
        row.querySelector('[data-inc]')?.addEventListener('click', () => {
          state.cart[l.id]++;
          saveCart();
          updateBadge();
          renderCart();
        });
        
        row.querySelector('[data-rm]')?.addEventListener('click', () => {
          delete state.cart[l.id];
          saveCart();
          updateBadge();
          renderCart();
        });
        
        list.appendChild(row);
      });
      
      const t = totals();
      document.getElementById('subTotal').textContent = fmt(t.sub);
      document.getElementById('shipCost').textContent = fmt(t.ship);
      document.getElementById('grandTotal').textContent = fmt(t.grand);
    }

    function openDrawer() {
      document.getElementById('drawer').classList.add('open');
      renderCart();
    }

    function closeDrawer() {
      document.getElementById('drawer').classList.remove('open');
    }

    function buildWhatsAppMessage() {
      const lines = cartLines();
      const { sub, ship, grand } = totals();
      const [shipMode] = document.getElementById('shippingOption').value.split('|');
      const name = document.getElementById('customerName').value.trim();
      const phone = document.getElementById('customerPhone').value.trim();
      const addr = document.getElementById('customerAddress').value.trim();

      let msg = `*${BUSINESS_NAME} — Nouvelle commande*` + "\n\n";
      msg += `Type: ${state.saleType === 'wholesale' ? 'Vente en gros' : 'Vente au détail'}\n`;
      if (name) msg += `Client: ${name}\n`;
      if (phone) msg += `Téléphone: ${phone}\n`;
      if (addr) msg += `Adresse: ${addr}\n`;
      msg += "\n*Articles:*\n";
      lines.forEach(l => {
        msg += `• ${l.qty} × ${l.name} — ${fmt(l.price)}/u (Sous-total: ${fmt(l.lineTotal)})\n`;
      });
      msg += `\nSous-total: ${fmt(sub)}\n`;
      msg += `Livraison (${shipMode === 'pickup' ? 'retrait' : (shipMode === 'city' ? 'ville' : 'hors ville')}): ${fmt(ship)}\n`;
      msg += `*Total: ${fmt(grand)}*`;
      return encodeURIComponent(msg);
    }

    function checkout() {
      if (!cartCount()) {
        showToast('Votre panier est vide');
        return;
      }
      const message = buildWhatsAppMessage();
      const url = `https://wa.me/${BUSINESS_PHONE}?text=${message}`;
      window.open(url, '_blank');
    }

    // === Events ===
    document.getElementById('openCart').addEventListener('click', openDrawer);
    document.getElementById('closeCart').addEventListener('click', closeDrawer);
    document.getElementById('overlay').addEventListener('click', closeDrawer);
    document.getElementById('clearCart').addEventListener('click', () => {
      state.cart = {};
      saveCart();
      updateBadge();
      renderCart();
      showToast('Panier vidé');
    });
    document.getElementById('checkout').addEventListener('click', checkout);
    document.getElementById('shippingOption').addEventListener('change', renderCart);

    document.getElementById('search').addEventListener('input', (e) => {
      state.query = e.target.value.toLowerCase();
      renderGrid();
    });

    // Gestion des onglets de navigation
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        document.getElementById('saleTypeSelector').style.display = tabName === 'retail' ? 'flex' : 'none';
        state.saleType = tabName === 'retail' ? 'retail' : 'wholesale';
        renderGrid();
      });
    });

    // Gestion du type de vente (détail/gros)
    document.querySelectorAll('.sale-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sale-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.saleType = btn.dataset.type;
        renderGrid();
      });
    });

    // === Start ===
    loadProducts(); // Charger les produits depuis le fichier JSON
    updateBadge();