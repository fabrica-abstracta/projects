const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const roles = [
  {
    id: "1",
    name: "Administrador",
    description: "Acceso completo al sistema y configuración de seguridad.",
    status: "active",
    users: 1,
    permissions: {
      "/resumen": ["search"],
      "/clientes": ["search", "create", "update", "delete"],
      "/planes": ["search", "create", "update", "delete"],
      "/membresias": [
        "search",
        "create",
        "update",
        "delete",
        "pay",
        "renew",
        "cancel",
      ],
      "/asistencias": ["search", "create", "update", "delete"],
      "/ventas": ["search", "create", "update", "delete", "export"],
      "/usuarios": ["search", "create", "update", "delete"],
      "/permisos": ["search", "create", "update", "delete"],
      "/configuraciones": ["search", "update"],
    },
  },
  {
    id: "2",
    name: "Recepción",
    description: "Gestiona clientes, membresías, pagos rápidos y asistencias.",
    status: "active",
    users: 3,
    permissions: {
      "/resumen": ["search"],
      "/clientes": ["search", "create", "update"],
      "/planes": ["search"],
      "/membresias": ["search", "create", "pay", "renew"],
      "/asistencias": ["search", "create"],
      "/ventas": ["search", "create"],
      "/usuarios": [],
      "/permisos": [],
      "/configuraciones": [],
    },
  },
  {
    id: "3",
    name: "Entrenador",
    description: "Consulta clientes y registra asistencias en sala.",
    status: "active",
    users: 2,
    permissions: {
      "/resumen": ["search"],
      "/clientes": ["search"],
      "/planes": ["search"],
      "/membresias": ["search"],
      "/asistencias": ["search", "create"],
      "/ventas": [],
      "/usuarios": [],
      "/permisos": [],
      "/configuraciones": [],
    },
  },
  {
    id: "4",
    name: "Caja",
    description: "Registra ventas, pagos y movimientos de caja.",
    status: "inactive",
    users: 0,
    permissions: {
      "/resumen": ["search"],
      "/clientes": [],
      "/planes": [],
      "/membresias": ["search", "pay"],
      "/asistencias": ["search"],
      "/ventas": ["search", "create", "export"],
      "/usuarios": [],
      "/permisos": [],
      "/configuraciones": [],
    },
  },
  {
    id: "5",
    name: "Supervisor",
    description: "Revisa operación diaria, caja, asistencias y reportes.",
    status: "active",
    users: 1,
    permissions: {
      "/resumen": ["search"],
      "/clientes": ["search"],
      "/planes": ["search"],
      "/membresias": ["search", "update", "renew"],
      "/asistencias": ["search", "create", "update"],
      "/ventas": ["search", "export"],
      "/usuarios": ["search"],
      "/permisos": [],
      "/configuraciones": ["search"],
    },
  },
  {
    id: "6",
    name: "Invitado",
    description: "Acceso temporal solo para consultar información general.",
    status: "inactive",
    users: 0,
    permissions: {
      "/resumen": ["search"],
      "/clientes": [],
      "/planes": [],
      "/membresias": [],
      "/asistencias": [],
      "/ventas": [],
      "/usuarios": [],
      "/permisos": [],
      "/configuraciones": [],
    },
  },
];

router.get("/roles/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    roles: roles.length,
    active: roles.filter((role) => role.status === "active").length,
    inactive: roles.filter((role) => role.status === "inactive").length,
    users: roles.reduce((total, role) => total + role.users, 0),
  });
});

router.get("/roles", async (req, res) => {
  await delay();

  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.perPage || 4);
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const status = String(req.query.status || "").trim();
  const assigned = String(req.query.assigned || "").trim();

  const filtered = roles.filter((role) => {
    if (status && role.status !== status) return false;
    if (assigned === "true" && role.users <= 0) return false;

    if (
      search &&
      !role.name.toLowerCase().includes(search) &&
      !role.description.toLowerCase().includes(search)
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

router.get("/roles/:id", async (req, res) => {
  await delay();

  return res.status(200).json(roles.find((role) => role.id === req.params.id));
});

router.post("/roles", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: req.body.id ? "ROLE_UPDATED" : "ROLE_CREATED",
  });
});

router.post("/roles/:id/permissions", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "ROLE_PERMISSIONS_UPDATED",
  });
});

router.delete("/roles/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "ROLE_DELETED",
  });
});

module.exports = router;
