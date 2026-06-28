const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const company = {
  commercialName: "PULSO Gym",
  legalName: "PULSO FITNESS S.A.C.",
  taxId: "20609988771",
  email: "contacto@pulsogym.pe",
  phone: "01 555 4040",
  whatsapp: "987 654 321",
  address: "Av. Los Deportistas 125",
  district: "Miraflores",
  city: "Lima",
  country: "Perú",
  mapsUrl: "https://maps.google.com/?q=Pulso+Gym+Lima",
  specialMessage: "Los feriados atendemos de 8:00 a.m. a 2:00 p.m.",
  hours: [
    { day: "Lunes", open: "06:00", close: "22:00", active: true },
    { day: "Martes", open: "06:00", close: "22:00", active: true },
    { day: "Miércoles", open: "06:00", close: "22:00", active: true },
    { day: "Jueves", open: "06:00", close: "22:00", active: true },
    { day: "Viernes", open: "06:00", close: "22:00", active: true },
    { day: "Sábado", open: "08:00", close: "18:00", active: true },
    { day: "Domingo", open: "08:00", close: "14:00", active: false },
  ],
};

const subscription = {
  plan: "Pro",
  status: "Activo",
  renewal: "27/07/2026",
  price: "S/ 99 / mes",
  usages: [
    { label: "Clientes", current: 82, limit: 500 },
    { label: "Usuarios", current: 4, limit: 10 },
    { label: "Planes", current: 6, limit: 20 },
    { label: "Membresías", current: 94, limit: 1000 },
    { label: "Ventas", current: 320, limit: "Ilimitado" },
  ],
  features: [
    "Gestión de clientes",
    "Planes y membresías",
    "Pagos y renovaciones",
    "Control de asistencias",
    "Ventas y caja",
    "Usuarios y permisos",
    "Soporte incluido",
    "Actualizaciones automáticas",
  ],
  plans: [
    {
      id: "basic",
      name: "Básico",
      price: "S/ 49 / mes",
      helper: "Para gimnasios pequeños que están empezando.",
      active: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "S/ 99 / mes",
      helper: "Plan actual con más límites y soporte incluido.",
      active: true,
    },
    {
      id: "enterprise",
      name: "Empresa",
      price: "S/ 199 / mes",
      helper: "Mayor capacidad, más usuarios y soporte prioritario.",
      active: false,
    },
  ],
};

const payments = {
  current: {
    date: "27/07/2026",
    concept: "Plan Pro mensual",
    method: "Yape",
    amount: 99,
    status: "pending",
  },
  history: [
    {
      id: "1",
      date: "27/06/2026",
      concept: "Plan Pro mensual",
      method: "Yape",
      amount: 99,
      status: "paid",
    },
    {
      id: "2",
      date: "27/05/2026",
      concept: "Plan Pro mensual",
      method: "Tarjeta",
      amount: 99,
      status: "paid",
    },
    {
      id: "3",
      date: "27/04/2026",
      concept: "Plan Pro mensual",
      method: "Tarjeta",
      amount: 99,
      status: "paid",
    },
    {
      id: "4",
      date: "27/07/2026",
      concept: "Plan Pro mensual",
      method: "Yape",
      amount: 99,
      status: "pending",
    },
  ],
};

const tickets = [
  {
    id: "1",
    code: "TK-0001",
    type: "Incidencia",
    subject: "No carga reporte de ventas",
    priority: "Alta",
    status: "review",
    date: "27/06/2026",
  },
  {
    id: "2",
    code: "TK-0002",
    type: "Mejora",
    subject: "Exportar comprobantes PDF",
    priority: "Media",
    status: "open",
    date: "26/06/2026",
  },
  {
    id: "3",
    code: "TK-0003",
    type: "Consulta",
    subject: "Duda sobre límites del plan",
    priority: "Baja",
    status: "answered",
    date: "21/06/2026",
  },
];

router.get("/settings/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    plan: "Pro",
    price: "S/ 99 mensual",
    users: "4 / 10",
    clients: "82 / 500",
    nextPayment: "27/07",
    pendingAmount: 99,
  });
});

router.get("/settings/company", async (req, res) => {
  await delay();

  return res.status(200).json(company);
});

router.post("/settings/company", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "COMPANY_UPDATED",
  });
});

router.get("/settings/subscription", async (req, res) => {
  await delay();

  return res.status(200).json(subscription);
});

router.post("/settings/subscription/change-plan", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "PLAN_CHANGE_REQUESTED",
  });
});

router.post("/settings/subscription/resources", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "RESOURCE_REQUEST_CREATED",
  });
});

router.get("/settings/payments", async (req, res) => {
  await delay();

  return res.status(200).json(payments);
});

router.post("/settings/payments/pay", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "SUBSCRIPTION_PAYMENT_CREATED",
  });
});

router.get("/settings/tickets", async (req, res) => {
  await delay();

  return res.status(200).json(tickets);
});

router.post("/settings/tickets", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "TICKET_CREATED",
  });
});

module.exports = router;
