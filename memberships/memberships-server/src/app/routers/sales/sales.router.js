// const router = require("express").Router();

// const { SaleSchema, MembershipSchema } = require("../../schemas");

// const {
//   searchSalesQuerySchema,
//   upsertSaleBodySchema,
//   getSaleParamsSchema,
//   deleteSaleParamsSchema,
// } = require("./sale.validator");

// const { body, query, params } = require("../../config/validator");

// router.get(
//   "/sales",
//   query(searchSalesQuerySchema),
//   // authorization("sale", "canSearch"),
//   async (req, res) => {
//     const filter = {
//       // company: req.identity.company.id,
//       ...(req.query.customer !== undefined && {
//         customer: req.query.customer,
//       }),
//       ...(req.query.date && {
//         date: {
//           ...(req.query.date.from && {
//             $gte: req.query.date.from,
//           }),
//           ...(req.query.date.to && {
//             $lte: req.query.date.to,
//           }),
//         },
//       }),
//     };

//     const skip = (req.query.page - 1) * req.query.perPage;
//     const limit = req.query.perPage;

//     const [items, totalItems] = await Promise.all([
//       SaleSchema.find(filter)
//         .populate({
//           path: "assistance",
//           populate: {
//             path: "membership",
//             populate: [{ path: "plan" }, { path: "customer" }],
//           },
//         })
//         .populate({
//           path: "membership",
//           populate: [{ path: "plan" }, { path: "customer" }],
//         })
//         .populate({ path: "customer" })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       SaleSchema.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(totalItems / limit);
//     const page = Math.floor(skip / limit) + 1;

//     return res.status(200).json({
//       data: items.map((record) => ({
//         id: String(record._id),
//         ...(record.assistance && {
//           assistance: {
//             id: String(record.assistance._id),
//             type: record.assistance.type,
//             ...(record.assistance.membership && {
//               membership: {
//                 id: String(record.assistance.membership._id),
//                 ...(record.assistance.membership.plan && {
//                   plan: {
//                     id: String(record.assistance.membership.plan._id),
//                     name: record.assistance.membership.plan.name,
//                     description: record.assistance.membership.plan.description,
//                     features: record.assistance.membership.plan.features,
//                     duration: record.assistance.membership.plan.duration,
//                     price: record.assistance.membership.plan.price,
//                     currency: record.assistance.membership.plan.currency,
//                     isActive: record.assistance.membership.plan.isActive,
//                   },
//                 }),
//                 ...(record.assistance.membership.customer && {
//                   customer: {
//                     id: String(record.assistance.membership.customer._id),
//                     document: record.assistance.membership.customer.document,
//                     number: record.assistance.membership.customer.number,
//                     paternal: record.assistance.membership.customer.paternal,
//                     maternal: record.assistance.membership.customer.maternal,
//                     names: record.assistance.membership.customer.names,
//                     birthdate: record.assistance.membership.customer.birthdate,
//                     gender: record.assistance.membership.customer.gender,
//                     phone: record.assistance.membership.customer.phone,
//                     email: record.assistance.membership.customer.email,
//                   },
//                 }),
//                 price: record.assistance.membership.price,
//                 currency: record.assistance.membership.currency,
//                 start: record.assistance.membership.start,
//                 end: record.assistance.membership.end,
//                 isActive: record.assistance.membership.isActive,
//               },
//             }),
//             date: record.assistance.date,
//           },
//         }),
//         ...(record.membership && {
//           membership: {
//             id: String(record.membership._id),
//             ...(record.membership.plan && {
//               plan: {
//                 id: String(record.membership.plan._id),
//                 name: record.membership.plan.name,
//                 description: record.membership.plan.description,
//                 features: record.membership.plan.features,
//                 duration: record.membership.plan.duration,
//                 price: record.membership.plan.price,
//                 currency: record.membership.plan.currency,
//                 isActive: record.membership.plan.isActive,
//               },
//             }),
//             ...(record.membership.customer && {
//               customer: {
//                 id: String(record.membership.customer._id),
//                 document: record.membership.customer.document,
//                 number: record.membership.customer.number,
//                 paternal: record.membership.customer.paternal,
//                 maternal: record.membership.customer.maternal,
//                 names: record.membership.customer.names,
//                 birthdate: record.membership.customer.birthdate,
//                 gender: record.membership.customer.gender,
//                 phone: record.membership.customer.phone,
//                 email: record.membership.customer.email,
//               },
//             }),
//             price: record.membership.price,
//             currency: record.membership.currency,
//             start: record.membership.start,
//             end: record.membership.end,
//             isActive: record.membership.isActive,
//           },
//         }),
//         ...(record.customer && {
//           customer: {
//             id: String(record.customer._id),
//             document: record.customer.document,
//             number: record.customer.number,
//             paternal: record.customer.paternal,
//             maternal: record.customer.maternal,
//             names: record.customer.names,
//             birthdate: record.customer.birthdate,
//             gender: record.customer.gender,
//             phone: record.customer.phone,
//             email: record.customer.email,
//           },
//         }),
//         description: record.description,
//         total: record.total,
//         currency: record.currency,
//         date: record.date,
//         created: record.createdAt,
//         updated: record.updatedAt,
//       })),
//       pagination: {
//         page,
//         perPage: limit,
//         totalPages,
//         totalItems,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     });
//   },
// );

// router.post(
//   "/sales",
//   body(upsertSaleBodySchema),
//   // (req, res, next) =>
//   // authorization("sale", req.body.id ? "canUpdate" : "canCreate")(
//   // req,
//   // res,
//   // next,
//   // ),
//   async (req, res) => {
//     const membership = await MembershipSchema.findOne({
//       _id: req.body.membership,
//       // company: req.identity.company.id,
//     });

//     if (!membership) {
//       return res.status(404).json({
//         message: "La membresía solicitada no fue encontrada.",
//       });
//     }

//     const record = await SaleSchema.create({
//       // company: req.identity.company.id,
//       membership: req.body.membership,
//       customer: membership.customer,
//       description: "Pago de membresía",
//       total: req.body.total,
//       currency: membership.currency,
//       date: req.body.date,
//     });

//     return res.status(200).json({
//       message: "El pago de la membresía fue registrado exitosamente.",
//     });
//   },
// );

// router.get(
//   "/sales/:id",
//   params(getSaleParamsSchema),
//   // authorization("sale", "canRead"),
//   async (req, res) => {
//     const record = await SaleSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     })
//       .populate({
//         path: "assistance",
//         populate: {
//           path: "membership",
//           populate: [{ path: "plan" }, { path: "customer" }],
//         },
//       })
//       .populate({
//         path: "membership",
//         populate: [{ path: "plan" }, { path: "customer" }],
//       })
//       .populate({ path: "customer" })
//       .lean();

//     if (!record) {
//       return res.status(404).json({
//         message: "La venta solicitada no fue encontrada.",
//       });
//     }

//     return res.status(200).json({
//       id: String(record._id),
//       ...(record.assistance && {
//         assistance: {
//           id: String(record.assistance._id),
//           type: record.assistance.type,
//           ...(record.assistance.membership && {
//             membership: {
//               id: String(record.assistance.membership._id),
//               ...(record.assistance.membership.plan && {
//                 plan: {
//                   id: String(record.assistance.membership.plan._id),
//                   name: record.assistance.membership.plan.name,
//                   description: record.assistance.membership.plan.description,
//                   features: record.assistance.membership.plan.features,
//                   duration: record.assistance.membership.plan.duration,
//                   price: record.assistance.membership.plan.price,
//                   currency: record.assistance.membership.plan.currency,
//                   isActive: record.assistance.membership.plan.isActive,
//                 },
//               }),
//               ...(record.assistance.membership.customer && {
//                 customer: {
//                   id: String(record.assistance.membership.customer._id),
//                   document: record.assistance.membership.customer.document,
//                   number: record.assistance.membership.customer.number,
//                   paternal: record.assistance.membership.customer.paternal,
//                   maternal: record.assistance.membership.customer.maternal,
//                   names: record.assistance.membership.customer.names,
//                   birthdate: record.assistance.membership.customer.birthdate,
//                   gender: record.assistance.membership.customer.gender,
//                   phone: record.assistance.membership.customer.phone,
//                   email: record.assistance.membership.customer.email,
//                 },
//               }),
//               price: record.assistance.membership.price,
//               currency: record.assistance.membership.currency,
//               start: record.assistance.membership.start,
//               end: record.assistance.membership.end,
//               isActive: record.assistance.membership.isActive,
//             },
//           }),
//           date: record.assistance.date,
//         },
//       }),
//       ...(record.membership && {
//         membership: {
//           id: String(record.membership._id),
//           ...(record.membership.plan && {
//             plan: {
//               id: String(record.membership.plan._id),
//               name: record.membership.plan.name,
//               description: record.membership.plan.description,
//               features: record.membership.plan.features,
//               duration: record.membership.plan.duration,
//               price: record.membership.plan.price,
//               currency: record.membership.plan.currency,
//               isActive: record.membership.plan.isActive,
//             },
//           }),
//           ...(record.membership.customer && {
//             customer: {
//               id: String(record.membership.customer._id),
//               document: record.membership.customer.document,
//               number: record.membership.customer.number,
//               paternal: record.membership.customer.paternal,
//               maternal: record.membership.customer.maternal,
//               names: record.membership.customer.names,
//               birthdate: record.membership.customer.birthdate,
//               gender: record.membership.customer.gender,
//               phone: record.membership.customer.phone,
//               email: record.membership.customer.email,
//             },
//           }),
//           price: record.membership.price,
//           currency: record.membership.currency,
//           start: record.membership.start,
//           end: record.membership.end,
//           isActive: record.membership.isActive,
//         },
//       }),
//       ...(record.customer && {
//         customer: {
//           id: String(record.customer._id),
//           document: record.customer.document,
//           number: record.customer.number,
//           paternal: record.customer.paternal,
//           maternal: record.customer.maternal,
//           names: record.customer.names,
//           birthdate: record.customer.birthdate,
//           gender: record.customer.gender,
//           phone: record.customer.phone,
//           email: record.customer.email,
//         },
//       }),
//       description: record.description,
//       total: record.total,
//       currency: record.currency,
//       date: record.date,
//       created: record.createdAt,
//       updated: record.updatedAt,
//     });
//   },
// );

// router.delete(
//   "/sales/:id",
//   params(deleteSaleParamsSchema),
//   // authorization("sale", "canDelete"),
//   async (req, res) => {
//     const record = await SaleSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     if (!record) {
//       return res.status(404).json({
//         message: "La venta solicitada no fue encontrada.",
//       });
//     }

//     if (record?.status && [].includes(record.status)) {
//       return res.status(409).json({
//         message: "La venta no puede ser modificada por su estado actual.",
//       });
//     }

//     // await canDelete({
//     //   Model: null,
//     //   key: "sale",
//     //   value: req.params.id,
//     //   // company: req.identity.company.id,
//     // });

//     await SaleSchema.deleteOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "sale",
//     // action: "remove",
//     // value: 1,
//     // });

//     return res.status(200).json({
//       message: "La venta fue eliminada exitosamente.",
//     });
//   },
// );

// module.exports = router;

const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const sales = [
  {
    id: "1",
    code: "V-0001",
    customer: "Ariana Mendoza Ríos",
    detail: "Pago Plan Mensual",
    origin: "membership",
    method: "cash",
    amount: 120,
    date: "27/06/2026",
    time: "08:12",
    status: "paid",
  },
  {
    id: "2",
    code: "V-0002",
    customer: "Joaquín Salazar Paz",
    detail: "Renovación Plan Trimestral",
    origin: "membership",
    method: "yape",
    amount: 320,
    date: "27/06/2026",
    time: "08:46",
    status: "paid",
  },
  {
    id: "3",
    code: "V-0003",
    customer: "Gabriel Rojas Núñez",
    detail: "Renovación Plan Semestral",
    origin: "membership",
    method: "card",
    amount: 560,
    date: "27/06/2026",
    time: "09:18",
    status: "paid",
  },
  {
    id: "4",
    code: "V-0004",
    customer: "Luciana Herrera Quispe",
    detail: "Bebida isotónica y toalla",
    origin: "product",
    method: "cash",
    amount: 38,
    date: "27/06/2026",
    time: "10:05",
    status: "paid",
  },
  {
    id: "5",
    code: "V-0005",
    customer: "Diego Ramírez Soto",
    detail: "Pago Plan Mensual",
    origin: "membership",
    method: "transfer",
    amount: 120,
    date: "26/06/2026",
    time: "18:42",
    status: "paid",
  },
  {
    id: "6",
    code: "V-0006",
    customer: "Fernanda Castillo Bravo",
    detail: "Pago Plan Mensual",
    origin: "membership",
    method: "yape",
    amount: 120,
    date: "26/06/2026",
    time: "17:15",
    status: "cancelled",
  },
  {
    id: "7",
    code: "V-0007",
    customer: "Mateo Fernández Ruiz",
    detail: "Cuota mantenimiento casillero",
    origin: "service",
    method: "cash",
    amount: 30,
    date: "25/06/2026",
    time: "19:20",
    status: "paid",
  },
  {
    id: "8",
    code: "V-0008",
    customer: "Valentina Cruz Paredes",
    detail: "Pago Plan Trimestral",
    origin: "membership",
    method: "card",
    amount: 320,
    date: "24/06/2026",
    time: "07:55",
    status: "paid",
  },
  {
    id: "9",
    code: "V-0009",
    customer: "Camila Torres Vega",
    detail: "Guantes de entrenamiento",
    origin: "product",
    method: "yape",
    amount: 65,
    date: "23/06/2026",
    time: "12:10",
    status: "paid",
  },
  {
    id: "10",
    code: "V-0010",
    customer: "Sebastián Vargas León",
    detail: "Pago Plan Semestral",
    origin: "membership",
    method: "card",
    amount: 560,
    date: "22/06/2026",
    time: "20:04",
    status: "paid",
  },
  {
    id: "11",
    code: "V-0011",
    customer: "Ariana Mendoza Ríos",
    detail: "Proteína individual",
    origin: "product",
    method: "cash",
    amount: 18,
    date: "21/06/2026",
    time: "09:35",
    status: "paid",
  },
  {
    id: "12",
    code: "V-0012",
    customer: "Joaquín Salazar Paz",
    detail: "Evaluación física",
    origin: "service",
    method: "transfer",
    amount: 45,
    date: "20/06/2026",
    time: "11:28",
    status: "paid",
  },
  {
    id: "13",
    code: "V-0013",
    customer: "Gabriel Rojas Núñez",
    detail: "Shaker PULSO",
    origin: "product",
    method: "yape",
    amount: 32,
    date: "19/06/2026",
    time: "16:50",
    status: "paid",
  },
  {
    id: "14",
    code: "V-0014",
    customer: "Diego Ramírez Soto",
    detail: "Pago Plan Mensual duplicado",
    origin: "membership",
    method: "cash",
    amount: 120,
    date: "18/06/2026",
    time: "08:44",
    status: "cancelled",
  },
];

router.get("/sales/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    today: sales
      .filter((sale) => sale.date === "27/06/2026" && sale.status === "paid")
      .reduce((total, sale) => total + sale.amount, 0),
    todayCount: sales.filter(
      (sale) => sale.date === "27/06/2026" && sale.status === "paid",
    ).length,
    month: sales
      .filter((sale) => sale.status === "paid")
      .reduce((total, sale) => total + sale.amount, 0),
    cancelled: sales.filter((sale) => sale.status === "cancelled").length,
  });
});

router.get("/sales", async (req, res) => {
  await delay();

  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.perPage || 6);
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const method = String(req.query.method || "").trim();
  const status = String(req.query.status || "").trim();
  const origin = String(req.query.origin || "").trim();

  const filtered = sales.filter((sale) => {
    if (method && sale.method !== method) return false;
    if (status && sale.status !== status) return false;
    if (origin && sale.origin !== origin) return false;

    if (
      search &&
      !sale.code.toLowerCase().includes(search) &&
      !sale.customer.toLowerCase().includes(search) &&
      !sale.detail.toLowerCase().includes(search)
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

router.get("/sales/:id", async (req, res) => {
  await delay();

  return res.status(200).json(sales.find((sale) => sale.id === req.params.id));
});

router.post("/sales", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: req.body.id ? "SALE_UPDATED" : "SALE_CREATED",
  });
});

router.delete("/sales/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "SALE_DELETED",
  });
});

module.exports = router;
