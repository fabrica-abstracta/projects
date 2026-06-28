const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const roles = [
  { id: "admin", name: "Administrador" },
  { id: "reception", name: "Recepción" },
  { id: "trainer", name: "Entrenador" },
  { id: "cashier", name: "Caja" },
];

const users = [
  {
    id: "1",
    names: "Rosa Martínez",
    email: "rosa.martinez@pulso.com",
    phone: "987 654 321",
    role: "admin",
    roleLabel: "Administrador",
    status: "active",
    lastAccess: "Hoy 08:40",
    createdAt: "12/06/2026",
  },
  {
    id: "2",
    names: "Luis Herrera",
    email: "luis.herrera@pulso.com",
    phone: "956 222 104",
    role: "reception",
    roleLabel: "Recepción",
    status: "active",
    lastAccess: "Hoy 07:15",
    createdAt: "18/06/2026",
  },
  {
    id: "3",
    names: "Daniela Cruz",
    email: "daniela.cruz@pulso.com",
    phone: "922 481 330",
    role: "trainer",
    roleLabel: "Entrenador",
    status: "pending",
    lastAccess: "Sin ingreso",
    createdAt: "25/06/2026",
  },
  {
    id: "4",
    names: "Marco Salazar",
    email: "marco.salazar@pulso.com",
    phone: "911 555 287",
    role: "cashier",
    roleLabel: "Caja",
    status: "blocked",
    lastAccess: "24/06/2026",
    createdAt: "04/05/2026",
  },
  {
    id: "5",
    names: "Camila Torres",
    email: "camila.torres@pulso.com",
    phone: "933 889 001",
    role: "trainer",
    roleLabel: "Entrenador",
    status: "active",
    lastAccess: "Ayer 19:20",
    createdAt: "20/06/2026",
  },
  {
    id: "6",
    names: "Andrés Pinedo",
    email: "andres.pinedo@pulso.com",
    phone: "901 220 778",
    role: "reception",
    roleLabel: "Recepción",
    status: "pending",
    lastAccess: "Sin ingreso",
    createdAt: "27/06/2026",
  },
];

router.get("/users/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    users: users.length,
    active: users.filter((user) => user.status === "active").length,
    pending: users.filter((user) => user.status === "pending").length,
    blocked: users.filter((user) => user.status === "blocked").length,
  });
});

router.get("/users/roles", async (req, res) => {
  await delay();

  return res.status(200).json(roles);
});

router.get("/users", async (req, res) => {
  await delay();

  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.perPage || 4);
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const role = String(req.query.role || "").trim();
  const status = String(req.query.status || "").trim();

  const filtered = users.filter((user) => {
    if (role && user.role !== role) return false;
    if (status && user.status !== status) return false;

    if (
      search &&
      !user.names.toLowerCase().includes(search) &&
      !user.email.toLowerCase().includes(search) &&
      !user.phone.toLowerCase().includes(search) &&
      !user.roleLabel.toLowerCase().includes(search)
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

router.get("/users/:id", async (req, res) => {
  await delay();

  return res.status(200).json(users.find((user) => user.id === req.params.id));
});

router.post("/users", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: req.body.id ? "USER_UPDATED" : "USER_CREATED",
  });
});

router.post("/users/:id/invite", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "USER_INVITATION_SENT",
  });
});

router.delete("/users/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "USER_DELETED",
  });
});

module.exports = router;
