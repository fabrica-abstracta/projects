const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const products = [
  {
    id: "1",
    name: "Agua mineral 625 ml",
    sku: "PROD-0001",
    category: "Bebidas",
    brand: "San Luis",
    stock: 42,
    price: 3,
    expiration: "18/09/2026",
    status: "ok",
  },
  {
    id: "2",
    name: "Bebida isotónica",
    sku: "PROD-0002",
    category: "Bebidas",
    brand: "Sporade",
    stock: 18,
    price: 5,
    expiration: "12/07/2026",
    status: "warning",
  },
  {
    id: "3",
    name: "Proteína individual",
    sku: "PROD-0003",
    category: "Suplementos",
    brand: "Pulso Fit",
    stock: 9,
    price: 12,
    expiration: "03/07/2026",
    status: "warning",
  },
  {
    id: "4",
    name: "Guantes de entrenamiento",
    sku: "PROD-0005",
    category: "Accesorios",
    brand: "Pulso Gear",
    stock: 14,
    price: 65,
    expiration: "-",
    status: "ok",
  },
  {
    id: "5",
    name: "Shaker PULSO",
    sku: "PROD-0006",
    category: "Accesorios",
    brand: "Pulso Gear",
    stock: 24,
    price: 32,
    expiration: "-",
    status: "ok",
  },
];

let cart = [
  {
    product: "1",
    quantity: 2,
  },
  {
    product: "2",
    quantity: 1,
  },
  {
    product: "5",
    quantity: 1,
  },
];

const getCart = () => {
  const items = cart
    .map((item) => {
      const product = products.find((product) => product.id === item.product);

      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const discount = 0;

  return {
    items,
    subtotal,
    discount,
    total: subtotal - discount,
  };
};

router.get("/point-of-sale/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    products: getCart().items.length,
    lowStock: products.filter((product) => product.stock <= 18).length,
    cash: 215,
  });
});

router.get("/point-of-sale/products", async (req, res) => {
  await delay();

  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const category = String(req.query.category || "").trim();

  return res.status(200).json(
    products.filter((product) => {
      if (category && product.category !== category) return false;

      if (
        search &&
        !product.name.toLowerCase().includes(search) &&
        !product.sku.toLowerCase().includes(search) &&
        !product.category.toLowerCase().includes(search) &&
        !product.brand.toLowerCase().includes(search)
      ) {
        return false;
      }

      return true;
    }),
  );
});

router.get("/point-of-sale/cart", async (req, res) => {
  await delay();

  return res.status(200).json(getCart());
});

router.post("/point-of-sale/cart", async (req, res) => {
  await delay();

  const product = String(req.body.product || "");
  const current = cart.find((item) => item.product === product);

  if (current) {
    current.quantity += 1;
  } else {
    cart.push({
      product,
      quantity: 1,
    });
  }

  return res.status(200).json(getCart());
});

router.patch("/point-of-sale/cart/:id", async (req, res) => {
  await delay();

  const current = cart.find((item) => item.product === req.params.id);

  if (current) {
    current.quantity = Math.max(1, Number(req.body.quantity || 1));
  }

  return res.status(200).json(getCart());
});

router.delete("/point-of-sale/cart/:id", async (req, res) => {
  await delay();

  cart = cart.filter((item) => item.product !== req.params.id);

  return res.status(200).json(getCart());
});

router.delete("/point-of-sale/cart", async (req, res) => {
  await delay();

  cart = [];

  return res.status(200).json({
    message: "CART_CLEARED",
  });
});

router.post("/point-of-sale/checkout", async (req, res) => {
  await delay();

  const currentCart = getCart();

  const receipt = {
    code: "PV-0001",
    status: "paid",
    method: req.body.method || "Yape",
    total: currentCart.total,
    items: currentCart.items,
  };

  cart = [];

  return res.status(200).json(receipt);
});

module.exports = router;
