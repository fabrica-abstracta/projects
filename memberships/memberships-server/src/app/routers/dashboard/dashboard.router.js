// const router = require("express").Router();

// const {
//   MembershipSchema,
//   AssistanceSchema,
//   SaleSchema,
// } = require("../../schemas");

// router.get(
//   "/summary",
//   // authorization("summary", "canRead"),
//   async (req, res) => {
//     const now = new Date();

//     const startOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       1,
//       0,
//       0,
//       0,
//       0,
//     );

//     const endOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       1,
//       0,
//       0,
//       0,
//       0,
//     );

//     const companyFilter = {
//       // company: req.identity.company.id,
//     };

//     const membershipFilter = {
//       ...companyFilter,
//       start: {
//         $lt: endOfMonth,
//       },
//       end: {
//         $gte: startOfMonth,
//       },
//     };

//     const activeMembershipFilter = {
//       ...membershipFilter,
//       isActive: true,
//     };

//     const dateFilter = {
//       ...companyFilter,
//       date: {
//         $gte: startOfMonth,
//         $lt: endOfMonth,
//       },
//     };

//     const [
//       activeMembers,
//       totalMemberships,
//       membershipAssistances,
//       visits,
//       saleSummary,
//     ] = await Promise.all([
//       MembershipSchema.countDocuments(activeMembershipFilter),

//       MembershipSchema.countDocuments(membershipFilter),

//       AssistanceSchema.countDocuments({
//         ...dateFilter,
//         type: "membership",
//       }),

//       AssistanceSchema.countDocuments({
//         ...dateFilter,
//         type: "visit",
//       }),

//       SaleSchema.aggregate([
//         {
//           $match: dateFilter,
//         },
//         {
//           $group: {
//             _id: null,
//             total: {
//               $sum: "$total",
//             },
//             transactions: {
//               $sum: 1,
//             },
//           },
//         },
//       ]),
//     ]);

//     return res.status(200).json([
//       {
//         value: activeMembers,
//         total: totalMemberships,
//       },
//       {
//         value: membershipAssistances,
//       },
//       {
//         value: visits,
//       },
//       {
//         value: saleSummary[0]?.total || 0,
//         total: saleSummary[0]?.transactions || 0,
//       },
//     ]);
//   },
// );

// router.get(
//   "/activities",
//   // authorization("activity", "canSearch"),
//   async (req, res) => {
//     const filter = {
//       // company: req.identity.company.id,
//     };

//     const items = await SaleSchema.find(filter)
//       .populate("customer")
//       .sort({ date: -1, createdAt: -1 })
//       .limit(10)
//       .lean();

//     return res.status(200).json(
//       items.map((record) => ({
//         id: String(record._id),
//         type: record.type,
//         ...(record.customer && {
//           names: record.customer.names,
//         }),
//         detail: record.description,
//         amount: record.total,
//         date: record.date,
//       })),
//     );
//   },
// );

// router.get(
//   "/expirations",
//   // authorization("membership", "canSearch"),
//   async (req, res) => {
//     const now = new Date();

//     const startOfToday = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate(),
//       0,
//       0,
//       0,
//       0,
//     );

//     const endOfWeek = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate() + 7,
//       0,
//       0,
//       0,
//       0,
//     );

//     const items = await MembershipSchema.find({
//       // company: req.identity.company.id,
//       isActive: true,
//       end: {
//         $lt: endOfWeek,
//       },
//     })
//       .populate("customer")
//       .sort({ end: 1, createdAt: -1 })
//       .limit(5)
//       .lean();

//     return res.status(200).json(
//       items.map((record) => ({
//         id: String(record._id),
//         ...(record.customer && {
//           names: record.customer.names,
//         }),
//         day: ((days) =>
//           days < 0
//             ? "Ya venció"
//             : days === 0
//               ? "Vence hoy"
//               : days === 1
//                 ? "Vence mañana"
//                 : `Vence en ${days} días`)(
//           Math.ceil(
//             (new Date(record.end) - startOfToday) / (1000 * 60 * 60 * 24),
//           ),
//         ),
//       })),
//     );
//   },
// );

// module.exports = router;

const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/summary", async (req, res) => {
  await delay();

  return res.status(200).json([
    {
      value: 128,
      total: 160,
    },
    {
      value: 342,
    },
    {
      value: 87,
    },
    {
      value: 4580,
      total: 64,
    },
  ]);
});

router.get("/activities", async (req, res) => {
  await delay();

  return res.status(200).json([
    {
      id: 1,
      type: "entry",
      name: "Carlos Mendoza",
      detail: "Ingreso con membresía mensual",
      time: "Hace 5 min",
    },
    {
      id: 2,
      type: "visit",
      name: "Lucía Torres",
      detail: "Pago de visita diaria",
      amount: 15,
      time: "Hace 12 min",
    },
    {
      id: 3,
      type: "pay",
      name: "Mariana López",
      detail: "Renovación de membresía mensual",
      amount: 120,
      time: "Hace 20 min",
    },
    {
      id: 4,
      type: "entry",
      name: "Jorge Ramírez",
      detail: "Ingreso con membresía activa",
      time: "Hace 31 min",
    },
    {
      id: 5,
      type: "pay",
      name: "Ana Castillo",
      detail: "Compra de membresía trimestral",
      amount: 320,
      time: "Hace 45 min",
    },
    {
      id: 6,
      type: "visit",
      name: "Pedro Salazar",
      detail: "Visita sin membresía",
      amount: 15,
      time: "Hace 1 h",
    },
    {
      id: 7,
      type: "entry",
      name: "Diego Flores",
      detail: "Ingreso a sala de pesas",
      time: "Hace 1 h 15 min",
    },
    {
      id: 8,
      type: "pay",
      name: "Valeria Ruiz",
      detail: "Pago pendiente completado",
      amount: 95,
      time: "Hace 1 h 40 min",
    },
    {
      id: 9,
      type: "entry",
      name: "Fernando Rojas",
      detail: "Ingreso con plan premium",
      time: "Hace 2 h",
    },
    {
      id: 10,
      type: "visit",
      name: "Camila Herrera",
      detail: "Pago por entrenamiento libre",
      amount: 20,
      time: "Hace 2 h 30 min",
    },
    // {
    //   id: 11,
    //   type: "pay",
    //   name: "Miguel Vargas",
    //   detail: "Renovación de membresía anual",
    //   amount: 980,
    //   time: "Hace 3 h",
    // },
    // {
    //   id: 12,
    //   type: "entry",
    //   name: "Sofía Paredes",
    //   detail: "Ingreso con membresía mensual",
    //   time: "Hace 3 h 20 min",
    // },
    // {
    //   id: 13,
    //   type: "visit",
    //   name: "Andrés Molina",
    //   detail: "Visita diaria registrada",
    //   amount: 15,
    //   time: "Hace 4 h",
    // },
    // {
    //   id: 14,
    //   type: "pay",
    //   name: "Rosa Medina",
    //   detail: "Pago de membresía semanal",
    //   amount: 45,
    //   time: "Hace 4 h 30 min",
    // },
    // {
    //   id: 15,
    //   type: "entry",
    //   name: "Luis Gutiérrez",
    //   detail: "Ingreso a entrenamiento funcional",
    //   time: "Hace 5 h",
    // },
  ]);
});

router.get("/expirations", async (req, res) => {
  await delay();

  return res.status(200).json([
    {
      id: 1,
      name: "Carlos Mendoza",
      days: 0,
    },
    {
      id: 2,
      name: "Lucía Torres",
      days: 1,
    },
    {
      id: 3,
      name: "Mariana López",
      days: 2,
    },
    {
      id: 4,
      name: "Jorge Ramírez",
      days: 3,
    },
    {
      id: 5,
      name: "Ana Castillo",
      days: 4,
    },
    // {
    //   id: 6,
    //   name: "Pedro Salazar",
    //   days: 5,
    // },
    // {
    //   id: 7,
    //   name: "Diego Flores",
    //   days: 6,
    // },
    // {
    //   id: 8,
    //   name: "Valeria Ruiz",
    //   days: 7,
    // },
    // {
    //   id: 9,
    //   name: "Fernando Rojas",
    //   days: 2,
    // },
    // {
    //   id: 10,
    //   name: "Camila Herrera",
    //   days: 1,
    // },
  ]);
});

module.exports = router;
