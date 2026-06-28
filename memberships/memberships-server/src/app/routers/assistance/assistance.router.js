// const router = require("express").Router();

// const { AssistanceSchema } = require("../../schemas");

// const {
//   searchAssistancesQuerySchema,
//   upsertAssistanceBodySchema,
//   getAssistanceParamsSchema,
//   deleteAssistanceParamsSchema,
// } = require("./assistance.validator");

// const { body, query, params } = require("../../config/validator");

// router.get(
//   "/assistances",
//   query(searchAssistancesQuerySchema),
//   // authorization("assistance", "canSearch"),
//   async (req, res) => {
//     const filter = {
//       // company: req.identity.company.id,
//       ...(req.query.type !== undefined && {
//         type: req.query.type,
//       }),
//       ...(req.query.membership !== undefined && {
//         customer: req.query.membership,
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
//       AssistanceSchema.find(filter)
//         .populate({
//           path: "membership",
//           populate: [{ path: "plan" }, { path: "customer" }],
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       AssistanceSchema.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(totalItems / limit);
//     const page = Math.floor(skip / limit) + 1;

//     return res.status(200).json({
//       data: items.map((record) => ({
//         id: String(record._id),
//         type: record.type,
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

// const hasValidMembership = async ({ membership, date }) => {
//   return await MembershipSchema.exists({
//     _id: membership,
//     // company: req.identity.company.id,
//     isActive: true,
//     start: {
//       $lte: date,
//     },
//     end: {
//       $gte: date,
//     },
//   });
// };

// router.post(
//   "/assistances",
//   body(upsertAssistanceBodySchema),
//   // (req, res, next) =>
//   // authorization("assistance", req.body.id ? "canUpdate" : "canCreate")(
//   // req,
//   // res,
//   // next,
//   // ),
//   async (req, res) => {
//     if (req.body.type === "membership") {
//       const validMembership = await hasValidMembership({
//         membership: req.body.membership,
//         date: req.body.date,
//       });

//       if (!validMembership) {
//         return res.status(409).json({
//           message: "La membresía no está vigente.",
//         });
//       }
//     }

//     if (req.body.id) {
//       const oldRecord = await AssistanceSchema.findOne({
//         _id: req.body.id,
//         // company: req.identity.company.id,
//       });

//       if (!oldRecord) {
//         return res.status(404).json({
//           message: "La asistencia solicitada no fue encontrada.",
//         });
//       }

//       if (oldRecord?.status && [].includes(oldRecord.status)) {
//         return res.status(409).json({
//           message:
//             "La asistencia no puede ser modificada por su estado actual.",
//         });
//       }

//       await AssistanceSchema.findOneAndUpdate(
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
//         message: "La asistencia fue actualizada exitosamente.",
//       });
//     }

//     const record = await AssistanceSchema.create({
//       ...req.body,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "assistance",
//     // });

//     if (req.body.type === "visit") {
//       await SaleSchema.create({
//         attendance: record._id,
//         description: "Visita diaria",
//         total: req.body.price,
//         date: req.body.date,
//         // company: req.identity.company.id,
//       });
//     }

//     return res.status(200).json({
//       id: String(record._id),
//       message: "La asistencia fue creada exitosamente.",
//     });
//   },
// );

// router.get(
//   "/assistances/:id",
//   params(getAssistanceParamsSchema),
//   // authorization("assistance", "canRead"),
//   async (req, res) => {
//     const record = await AssistanceSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     })
//       .populate({
//         path: "membership",
//         populate: [{ path: "plan" }, { path: "customer" }],
//       })
//       .lean();

//     if (!record) {
//       return res.status(404).json({
//         message: "La asistencia solicitada no fue encontrada.",
//       });
//     }

//     return res.status(200).json({
//       id: String(record._id),
//       type: record.type,
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
//       date: record.date,
//       created: record.createdAt,
//       updated: record.updatedAt,
//     });
//   },
// );

// router.delete(
//   "/assistances/:id",
//   params(deleteAssistanceParamsSchema),
//   // authorization("assistance", "canDelete"),
//   async (req, res) => {
//     const record = await AssistanceSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     if (!record) {
//       return res.status(404).json({
//         message: "La asistencia solicitada no fue encontrada.",
//       });
//     }

//     if (record?.status && [].includes(record.status)) {
//       return res.status(409).json({
//         message: "La asistencia no puede ser modificada por su estado actual.",
//       });
//     }

//     // await canDelete({
//     //   Model: null,
//     //   key: "assistance",
//     //   value: req.params.id,
//     //   // company: req.identity.company.id,
//     // });

//     await AssistanceSchema.deleteOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "assistance",
//     // action: "remove",
//     // value: 1,
//     // });

//     return res.status(200).json({
//       message: "La asistencia fue eliminada exitosamente.",
//     });
//   },
// );

// module.exports = router;

const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const clients = [
  {
    id: "1",
    name: "Diego Ramírez Soto",
    document: "74859621",
    phone: "987 654 321",
    plan: {
      name: "Plan Mensual",
      status: "expiring",
      end: "30/06/2026",
    },
  },
  {
    id: "2",
    name: "Valentina Cruz Paredes",
    document: "70251489",
    phone: "956 213 478",
    plan: {
      name: "Plan Trimestral",
      status: "active",
      end: "15/08/2026",
    },
  },
  {
    id: "3",
    name: "Camila Torres Vega",
    document: "72669134",
    phone: "978 332 110",
    plan: {
      name: "Plan Mensual",
      status: "expired",
      end: "31/05/2026",
    },
  },
  {
    id: "4",
    name: "Mateo Fernández Ruiz",
    document: "71447820",
    phone: "945 110 982",
    plan: null,
  },
];

const attendances = [
  {
    id: "1",
    type: "client",
    date: "28/06/2026",
    time: "08:12",
    person: "Diego Ramírez Soto",
    document: "74859621",
    concept: "Plan Mensual",
    amount: null,
    method: null,
    status: "registered",
  },
  {
    id: "2",
    type: "visit",
    date: "28/06/2026",
    time: "09:40",
    person: "Carlos Medina",
    document: "70125478",
    concept: "Visita libre",
    amount: 15,
    method: "Yape",
    status: "paid",
  },
  {
    id: "3",
    type: "client",
    date: "28/06/2026",
    time: "10:05",
    person: "Valentina Cruz Paredes",
    document: "70251489",
    concept: "Plan Trimestral",
    amount: null,
    method: null,
    status: "registered",
  },
  {
    id: "4",
    type: "visit",
    date: "28/06/2026",
    time: "11:20",
    person: "Lucía Torres",
    document: "73458210",
    concept: "Clase funcional",
    amount: 20,
    method: "Efectivo",
    status: "paid",
  },
  {
    id: "5",
    type: "client",
    date: "28/06/2026",
    time: "12:10",
    person: "Camila Torres Vega",
    document: "72669134",
    concept: "Membresía vencida",
    amount: null,
    method: null,
    status: "observed",
  },
  {
    id: "6",
    type: "visit",
    date: "27/06/2026",
    time: "18:45",
    person: "Jorge Salazar",
    document: "76985412",
    concept: "Evaluación",
    amount: 25,
    method: "Plin",
    status: "paid",
  },
];

router.get("/attendances/summary", async (req, res) => {
  await delay();

  return res.status(200).json({
    attendances: attendances.filter((item) => item.type === "client").length,
    visits: attendances.filter((item) => item.type === "visit").length,
    cash: attendances
      .filter((item) => item.type === "visit")
      .reduce((total, item) => total + Number(item.amount || 0), 0),
  });
});

router.get("/attendances/clients", async (req, res) => {
  await delay();

  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();

  return res.status(200).json(
    clients.filter((client) => {
      if (
        search &&
        !client.name.toLowerCase().includes(search) &&
        !client.document.toLowerCase().includes(search) &&
        !client.phone.toLowerCase().includes(search)
      ) {
        return false;
      }

      return true;
    }),
  );
});

router.get("/attendances", async (req, res) => {
  await delay();

  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.perPage || 5);
  const search = String(req.query.search || "")
    .trim()
    .toLowerCase();

  const filtered = attendances.filter((attendance) => {
    if (
      search &&
      !attendance.person.toLowerCase().includes(search) &&
      !attendance.document.toLowerCase().includes(search) &&
      !attendance.concept.toLowerCase().includes(search)
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

router.post("/attendances", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "ATTENDANCE_CREATED",
  });
});

router.post("/attendances/visits", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "VISIT_CREATED",
  });
});

module.exports = router;
