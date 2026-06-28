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
    minStock: 15,
    salePrice: 3,
    cost: 1.8,
    nearestExpiration: "18/09/2026",
    expirationStatus: "ok",
    status: "active",
  },
  {
    id: "2",
    name: "Bebida isotónica",
    sku: "PROD-0002",
    category: "Bebidas",
    brand: "Sporade",
    stock: 18,
    minStock: 20,
    salePrice: 5,
    cost: 3.2,
    nearestExpiration: "12/07/2026",
    expirationStatus: "warning",
    status: "active",
  },
  {
    id: "3",
    name: "Proteína individual",
    sku: "PROD-0003",
    category: "Suplementos",
    brand: "Pulso Fit",
    stock: 9,
    minStock: 10,
    salePrice: 12,
    cost: 7.5,
    nearestExpiration: "03/07/2026",
    expirationStatus: "warning",
    status: "active",
  },
  {
    id: "4",
    name: "Barra energética",
    sku: "PROD-0004",
    category: "Snacks",
    brand: "Energy Pro",
    stock: 0,
    minStock: 12,
    salePrice: 6,
    cost: 3.9,
    nearestExpiration: "28/06/2026",
    expirationStatus: "expired",
    status: "inactive",
  },
  {
    id: "5",
    name: "Guantes de entrenamiento",
    sku: "PROD-0005",
    category: "Accesorios",
    brand: "Pulso Gear",
    stock: 14,
    minStock: 5,
    salePrice: 65,
    cost: 38,
    nearestExpiration: "-",
    expirationStatus: "ok",
    status: "active",
  },
  {
    id: "6",
    name: "Shaker PULSO",
    sku: "PROD-0006",
    category: "Accesorios",
    brand: "Pulso Gear",
    stock: 24,
    minStock: 8,
    salePrice: 32,
    cost: 18,
    nearestExpiration: "-",
    expirationStatus: "ok",
    status: "active",
  },
];

const categories = [
  { id: "1", name: "Bebidas", products: 2, status: "active" },
  { id: "2", name: "Suplementos", products: 1, status: "active" },
  { id: "3", name: "Snacks", products: 1, status: "active" },
  { id: "4", name: "Accesorios", products: 2, status: "active" },
];

const brands = [
  { id: "1", name: "San Luis", products: 1, status: "active" },
  { id: "2", name: "Sporade", products: 1, status: "active" },
  { id: "3", name: "Pulso Fit", products: 1, status: "active" },
  { id: "4", name: "Pulso Gear", products: 2, status: "active" },
  { id: "5", name: "Energy Pro", products: 1, status: "active" },
];

router.get("/products/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    products: products.length,
    lowStock: products.filter((product) => product.stock <= product.minStock)
      .length,
    expiring: products.filter(
      (product) => product.expirationStatus === "warning",
    ).length,
    expired: products.filter(
      (product) => product.expirationStatus === "expired",
    ).length,
  });
});

router.get("/products/categories", async (req, res) => {
  await delay();

  return res.status(200).json(categories);
});

router.post("/products/categories", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "CATEGORY_CREATED",
  });
});

router.delete("/products/categories/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "CATEGORY_DELETED",
  });
});

router.get("/products/brands", async (req, res) => {
  await delay();

  return res.status(200).json(brands);
});

router.post("/products/brands", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "BRAND_CREATED",
  });
});

router.delete("/products/brands/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "BRAND_DELETED",
  });
});

router.get("/products", async (req, res) => {
  await delay();

  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.perPage || 4);
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const category = String(req.query.category || "").trim();
  const stock = String(req.query.stock || "").trim();
  const expiration = String(req.query.expiration || "").trim();

  const filtered = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (stock === "low" && product.stock > product.minStock) return false;
    if (expiration && product.expirationStatus !== expiration) return false;

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
  });

  return res.status(200).json({
    data: filtered.slice((page - 1) * perPage, page * perPage),
    page,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
  });
});

router.get("/products/:id", async (req, res) => {
  await delay();

  return res
    .status(200)
    .json(products.find((product) => product.id === req.params.id));
});

router.post("/products", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: req.body.id ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
  });
});

router.post("/products/:id/stock", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "STOCK_CREATED",
  });
});

router.delete("/products/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "PRODUCT_DELETED",
  });
});

module.exports = router;
