const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const lots = [
  {
    id: "1",
    code: "ENT-0001",
    product: "Agua mineral 625 ml",
    category: "Bebidas",
    brand: "San Luis",
    quantity: 48,
    available: 42,
    expiration: "18/09/2026",
    entryDate: "20/06/2026",
    cost: 1.8,
    status: "available",
  },
  {
    id: "2",
    code: "ENT-0002",
    product: "Bebida isotónica",
    category: "Bebidas",
    brand: "Sporade",
    quantity: 24,
    available: 18,
    expiration: "12/07/2026",
    entryDate: "18/06/2026",
    cost: 3.2,
    status: "warning",
  },
  {
    id: "3",
    code: "ENT-0003",
    product: "Proteína individual",
    category: "Suplementos",
    brand: "Pulso Fit",
    quantity: 12,
    available: 9,
    expiration: "03/07/2026",
    entryDate: "10/06/2026",
    cost: 7.5,
    status: "warning",
  },
  {
    id: "4",
    code: "ENT-0004",
    product: "Barra energética",
    category: "Snacks",
    brand: "Energy Pro",
    quantity: 30,
    available: 0,
    expiration: "28/06/2026",
    entryDate: "01/06/2026",
    cost: 3.9,
    status: "expired",
  },
  {
    id: "5",
    code: "ENT-0005",
    product: "Shaker PULSO",
    category: "Accesorios",
    brand: "Pulso Gear",
    quantity: 30,
    available: 24,
    expiration: "-",
    entryDate: "22/06/2026",
    cost: 18,
    status: "available",
  },
];

router.get("/product-lots/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    entries: lots.length,
    available: lots.reduce((total, lot) => total + lot.available, 0),
    warning: lots.filter((lot) => lot.status === "warning").length,
    expired: lots.filter((lot) => lot.status === "expired").length,
  });
});

router.get("/product-lots", async (req, res) => {
  await delay();

  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const status = String(req.query.status || "").trim();
  const category = String(req.query.category || "").trim();

  return res.status(200).json(
    lots.filter((lot) => {
      if (status && lot.status !== status) return false;
      if (category && lot.category !== category) return false;

      if (
        search &&
        !lot.code.toLowerCase().includes(search) &&
        !lot.product.toLowerCase().includes(search) &&
        !lot.brand.toLowerCase().includes(search) &&
        !lot.category.toLowerCase().includes(search)
      ) {
        return false;
      }

      return true;
    }),
  );
});

router.get("/product-lots/:id", async (req, res) => {
  await delay();

  return res.status(200).json(lots.find((lot) => lot.id === req.params.id));
});

router.post("/product-lots", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "LOT_UPDATED",
  });
});

router.post("/product-lots/:id/consume", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "LOT_CONSUMED",
  });
});

router.delete("/product-lots/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "LOT_DELETED",
  });
});

module.exports = router;
