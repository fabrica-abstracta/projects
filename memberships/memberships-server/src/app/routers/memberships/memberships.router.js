// const router = require("express").Router();

// const { MembershipSchema } = require("../../schemas");

// const {
//   searchMembershipsQuerySchema,
//   upsertMembershipBodySchema,
//   getMembershipParamsSchema,
//   deleteMembershipParamsSchema,
// } = require("./membership.validator");

// const { body, query, params } = require("../../config/validator");

// router.get(
//   "/memberships",
//   query(searchMembershipsQuerySchema),
//   // authorization("membership", "canSearch"),
//   async (req, res) => {
//     const filter = {
//       // company: req.identity.company.id,
//       ...(req.query.plan !== undefined && {
//         plan: req.query.plan,
//       }),
//       ...(req.query.customer !== undefined && {
//         customer: req.query.customer,
//       }),
//       ...(req.query.start && {
//         start: {
//           ...(req.query.start.from && {
//             $gte: req.query.start.from,
//           }),
//           ...(req.query.start.to && {
//             $lte: req.query.start.to,
//           }),
//         },
//       }),
//       ...(req.query.isActive !== undefined && {
//         isActive: req.query.isActive,
//       }),
//     };

//     const skip = (req.query.page - 1) * req.query.perPage;
//     const limit = req.query.perPage;

//     const [items, totalItems] = await Promise.all([
//       MembershipSchema.find(filter)
//         .populate({ path: "plan" })
//         .populate({ path: "customer" })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       MembershipSchema.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(totalItems / limit);
//     const page = Math.floor(skip / limit) + 1;

//     return res.status(200).json({
//       data: items.map((record) => ({
//         id: String(record._id),
//         ...(record.plan && {
//           plan: {
//             id: String(record.plan._id),
//             name: record.plan.name,
//             description: record.plan.description,
//             features: record.plan.features,
//             duration: record.plan.duration,
//             price: record.plan.price,
//             currency: record.plan.currency,
//             isActive: record.plan.isActive,
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
//         price: record.price,
//         currency: record.currency,
//         start: record.start,
//         end: record.end,
//         isActive: record.isActive,
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

// const canSaveMembership = async ({ id, customer, start, end, company }) => {
//   return !(await MembershipSchema.exists({
//     _id: {
//       $ne: id,
//     },
//     customer,
//     // company,
//     isActive: true,
//     start: {
//       $lt: end,
//     },
//     end: {
//       $gt: start,
//     },
//   }));
// };

// router.post(
//   "/memberships",
//   body(upsertMembershipBodySchema),
//   // (req, res, next) =>
//   // authorization("membership", req.body.id ? "canUpdate" : "canCreate")(
//   // req,
//   // res,
//   // next,
//   // ),
//   async (req, res) => {
//     const plan = await PlanSchema.findOne({
//       _id: req.body.plan,
//       // company: req.identity.company.id,
//       isActive: true,
//     });

//     if (!plan) {
//       return res.status(404).json({
//         message: "El plan solicitado no fue encontrado.",
//       });
//     }

//     req.body.price = plan.price;
//     req.body.currency = plan.currency;
//     req.body.end = new Date(req.body.start);
//     req.body.end.setMonth(req.body.end.getMonth() + plan.duration);

//     if (req.body.id) {
//       const oldRecord = await MembershipSchema.findOne({
//         _id: req.body.id,
//         // company: req.identity.company.id,
//       });

//       if (!oldRecord) {
//         return res.status(404).json({
//           message: "La membresía solicitada no fue encontrada.",
//         });
//       }

//       if (oldRecord?.status && [].includes(oldRecord.status)) {
//         return res.status(409).json({
//           message: "La membresía no puede ser modificada por su estado actual.",
//         });
//       }

//       const canSave = await canSaveMembership({
//         id: req.body.id,
//         customer: req.body.customer,
//         start: req.body.start,
//         end: req.body.end,
//         // company: req.identity.company.id,
//       });

//       if (!canSave) {
//         return res.status(409).json({
//           message: "El cliente ya tiene una membresía activa.",
//         });
//       }

//       await MembershipSchema.findOneAndUpdate(
//         {
//           _id: req.body.id,
//           // company: req.identity.company.id,
//         },
//         {
//           $set: req.body,
//         },
//         {
//           new: true,
//           runValidators: true,
//         },
//       );

//       return res.status(200).json({
//         message: "La membresía fue actualizada exitosamente.",
//       });
//     }

//     const canSave = await canSaveMembership({
//       id: req.body.id,
//       customer: req.body.customer,
//       start: req.body.start,
//       end: req.body.end,
//       // company: req.identity.company.id,
//     });

//     if (!canSave) {
//       return res.status(409).json({
//         message: "El cliente ya tiene una membresía activa.",
//       });
//     }

//     const record = await MembershipSchema.create({
//       ...req.body,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "membership",
//     // });

//     return res.status(200).json({
//       message: "La membresía fue creada exitosamente.",
//     });
//   },
// );

// router.get(
//   "/memberships/:id",
//   params(getMembershipParamsSchema),
//   // authorization("membership", "canRead"),
//   async (req, res) => {
//     const record = await MembershipSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     })
//       .populate({ path: "plan" })
//       .populate({ path: "customer" })
//       .lean();

//     if (!record) {
//       return res.status(404).json({
//         message: "La membresía solicitada no fue encontrada.",
//       });
//     }

//     return res.status(200).json({
//       id: String(record._id),
//       ...(record.plan && {
//         plan: {
//           id: String(record.plan._id),
//           name: record.plan.name,
//           description: record.plan.description,
//           features: record.plan.features,
//           duration: record.plan.duration,
//           price: record.plan.price,
//           currency: record.plan.currency,
//           isActive: record.plan.isActive,
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
//       price: record.price,
//       currency: record.currency,
//       start: record.start,
//       end: record.end,
//       isActive: record.isActive,
//       created: record.createdAt,
//       updated: record.updatedAt,
//     });
//   },
// );

// router.delete(
//   "/memberships/:id",
//   params(deleteMembershipParamsSchema),
//   // authorization("membership", "canDelete"),
//   async (req, res) => {
//     const record = await MembershipSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     if (!record) {
//       return res.status(404).json({
//         message: "La membresía solicitada no fue encontrada.",
//       });
//     }

//     if (record?.status && [].includes(record.status)) {
//       return res.status(409).json({
//         message: "La membresía no puede ser modificada por su estado actual.",
//       });
//     }

//     // await canDelete({
//     //   Model: null,
//     //   key: "membership",
//     //   value: req.params.id,
//     //   // company: req.identity.company.id,
//     // });

//     await MembershipSchema.deleteOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "membership",
//     // action: "remove",
//     // value: 1,
//     // });

//     return res.status(200).json({
//       message: "La membresía fue eliminada exitosamente.",
//     });
//   },
// );

// module.exports = router;

const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const memberships = [
  {
    id: "1",
    client: "Diego Ramírez Soto",
    phone: "987 654 321",
    plan: "Plan Mensual",
    start: "01/06/2026",
    end: "30/06/2026",
    status: "expiring",
    payment: "paid",
    amount: 120,
    method: "Yape",
  },
  {
    id: "2",
    client: "Valentina Cruz Paredes",
    phone: "956 213 478",
    plan: "Plan Trimestral",
    start: "15/05/2026",
    end: "15/08/2026",
    status: "active",
    payment: "paid",
    amount: 320,
    method: "Efectivo",
  },
  {
    id: "3",
    client: "Camila Torres Vega",
    phone: "978 332 110",
    plan: "Plan Mensual",
    start: "01/05/2026",
    end: "31/05/2026",
    status: "expired",
    payment: "paid",
    amount: 120,
    method: "Tarjeta",
  },
  {
    id: "4",
    client: "Mateo Fernández Ruiz",
    phone: "945 110 982",
    plan: "Plan Anual",
    start: "02/01/2026",
    end: "02/01/2027",
    status: "active",
    payment: "pending",
    amount: 980,
    method: "Sin método",
  },
  {
    id: "5",
    client: "Lucía Salazar Díaz",
    phone: "922 458 701",
    plan: "Plan Semestral",
    start: "10/04/2026",
    end: "10/10/2026",
    status: "active",
    payment: "paid",
    amount: 560,
    method: "Plin",
  },
  {
    id: "6",
    client: "Andrés Flores Medina",
    phone: "911 320 456",
    plan: "Plan Mensual",
    start: "01/06/2026",
    end: "30/06/2026",
    status: "cancelled",
    payment: "pending",
    amount: 120,
    method: "Sin método",
  },
];

router.get("/memberships/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    clients: memberships.length,
    active: memberships.filter((item) => item.status === "active").length,
    expiring: memberships.filter((item) => item.status === "expiring").length,
    expired: memberships.filter((item) => item.status === "expired").length,
  });
});

router.get("/memberships", async (req, res) => {
  await delay();

  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.perPage || 4);
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();
  const status = String(req.query.status || "").trim();

  const filtered = memberships.filter((item) => {
    if (status === "pending" && item.payment !== "pending") return false;
    if (status && status !== "pending" && item.status !== status) return false;

    if (
      search &&
      !item.client.toLowerCase().includes(search) &&
      !item.phone.toLowerCase().includes(search) &&
      !item.plan.toLowerCase().includes(search)
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

router.post("/memberships", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "MEMBERSHIP_CREATED",
  });
});

router.post("/memberships/:id/payments", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "PAYMENT_CREATED",
  });
});

router.post("/memberships/:id/renew", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "MEMBERSHIP_RENEWED",
  });
});

router.post("/memberships/:id/cancel", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "MEMBERSHIP_CANCELLED",
  });
});

module.exports = router;
