/* =========================================================
   RESTO · Capa de datos compartida (localStorage)
   Simula un backend para que las 4 pantallas se comuniquen.
   ========================================================= */

const RESTO_DB = {
  KEYS: { locales: 'resto_locales', productos: 'resto_productos', pedidos: 'resto_pedidos', activo: 'resto_local_activo' },

  seed() {
    if (!localStorage.getItem(this.KEYS.locales)) {
      const locales = [
        { id: 'L1', nombre: 'Miraflores Centro', direccion: 'Av. Larco 345' },
        { id: 'L2', nombre: 'San Isidro Golf',   direccion: 'Av. Camino Real 890' },
        { id: 'L3', nombre: 'Barranco Bohemio',  direccion: 'Jr. Grau 120' },
      ];
      localStorage.setItem(this.KEYS.locales, JSON.stringify(locales));
    }
    if (!localStorage.getItem(this.KEYS.productos)) {
      const cats = ['Entradas', 'Fondos', 'Bebidas', 'Postres'];
      const base = [
        { nombre: 'Ceviche Clásico',      cat: 'Entradas', precio: 38, desc: 'Pescado del día, leche de tigre, camote y choclo.', emoji: '🐟' },
        { nombre: 'Causa Limeña',         cat: 'Entradas', precio: 24, desc: 'Papa amarilla, ají amarillo, pollo o mixta.',       emoji: '🥔' },
        { nombre: 'Lomo Saltado',         cat: 'Fondos',   precio: 42, desc: 'Res salteada, papas fritas, arroz y sillao.',       emoji: '🥩' },
        { nombre: 'Arroz con Mariscos',   cat: 'Fondos',   precio: 45, desc: 'Mariscos frescos, arroz al ajillo, culantro.',      emoji: '🍤' },
        { nombre: 'Ají de Gallina',       cat: 'Fondos',   precio: 32, desc: 'Pollo deshilachado en crema de ají amarillo.',      emoji: '🍛' },
        { nombre: 'Chicha Morada 1L',     cat: 'Bebidas',  precio: 15, desc: 'Maíz morado, piña, canela y clavo de olor.',        emoji: '🥤' },
        { nombre: 'Limonada Frozen',      cat: 'Bebidas',  precio: 14, desc: 'Limón, hierbabuena, hielo frappé.',                 emoji: '🍋' },
        { nombre: 'Suspiro a la Limeña',  cat: 'Postres',  precio: 18, desc: 'Manjar blanco, merengue al oporto.',                emoji: '🍮' },
      ];
      const productos = [];
      let n = 1;
      RESTO_DB._locIds().forEach(locId => {
        base.forEach(p => {
          productos.push({
            id: `P${n++}`,
            localId: locId,
            nombre: p.nombre,
            categoria: p.cat,
            precio: p.precio,
            descripcion: p.desc,
            emoji: p.emoji,
            activoHoy: true,
            stockHoy: Math.floor(Math.random() * 20) + 10,
          });
        });
      });
      localStorage.setItem(this.KEYS.productos, JSON.stringify(productos));
    }
    if (!localStorage.getItem(this.KEYS.pedidos)) {
      localStorage.setItem(this.KEYS.pedidos, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.activo)) {
      localStorage.setItem(this.KEYS.activo, 'L1');
    }
  },

  _locIds() { return ['L1', 'L2', 'L3']; },

  // ---- Locales ----
  getLocales() { return JSON.parse(localStorage.getItem(this.KEYS.locales) || '[]'); },
  getLocalActivo() { return localStorage.getItem(this.KEYS.activo) || 'L1'; },
  setLocalActivo(id) { localStorage.setItem(this.KEYS.activo, id); },

  // ---- Productos ----
  getProductos(localId) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.productos) || '[]');
    return localId ? all.filter(p => p.localId === localId) : all;
  },
  saveProducto(prod) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.productos) || '[]');
    const idx = all.findIndex(p => p.id === prod.id);
    if (idx >= 0) all[idx] = prod; else all.push(prod);
    localStorage.setItem(this.KEYS.productos, JSON.stringify(all));
  },
  deleteProducto(id) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.productos) || '[]').filter(p => p.id !== id);
    localStorage.setItem(this.KEYS.productos, JSON.stringify(all));
  },
  toggleStock(id) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.productos) || '[]');
    const p = all.find(x => x.id === id);
    if (p) p.activoHoy = !p.activoHoy;
    localStorage.setItem(this.KEYS.productos, JSON.stringify(all));
  },

  // ---- Pedidos / Comandas ----
  getPedidos(localId) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.pedidos) || '[]');
    return localId ? all.filter(p => p.localId === localId) : all;
  },
  crearPedido(pedido) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.pedidos) || '[]');
    pedido.id = 'C' + Date.now();
    pedido.creado = Date.now();
    pedido.estado = 'pendiente';
    all.unshift(pedido);
    localStorage.setItem(this.KEYS.pedidos, JSON.stringify(all));
    return pedido;
  },
  actualizarEstado(id, estado) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.pedidos) || '[]');
    const p = all.find(x => x.id === id);
    if (p) p.estado = estado;
    localStorage.setItem(this.KEYS.pedidos, JSON.stringify(all));
  },
};

RESTO_DB.seed();
