// const router = require("express").Router();

// const { PlanSchema, MembershipSchema } = require("../../schemas");

// const {
//   searchPlansQuerySchema,
//   upsertPlanBodySchema,
//   getPlanParamsSchema,
//   deletePlanParamsSchema,
// } = require("./plan.validator");

// const { body, query, params } = require("../../config/validator");

// router.get(
//   "/plans",
//   query(searchPlansQuerySchema),
//   // authorization("plan", "canSearch"),
//   async (req, res) => {
//     const filter = {
//       // company: req.identity.company.id,
//       ...(req.query.name !== undefined && {
//         name: req.query.name,
//       }),
//     };

//     const skip = (req.query.page - 1) * req.query.perPage;
//     const limit = req.query.perPage;

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

//     const startOfNextMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       1,
//       0,
//       0,
//       0,
//       0,
//     );

//     const getMembers = (plan) =>
//       MembershipSchema.countDocuments({
//         plan,
//         isActive: true,
//         start: { $lt: startOfNextMonth },
//         end: { $gte: startOfMonth },
//         // company: req.identity.company.id,
//       });

//     const [items, totalItems] = await Promise.all([
//       PlanSchema.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       PlanSchema.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(totalItems / limit);
//     const page = Math.floor(skip / limit) + 1;

//     return res.status(200).json({
//       data: await Promise.all(
//         items.map(async (record) => ({
//           id: String(record._id),
//           name: record.name,
//           description: record.description,
//           features: record.features,
//           duration: record.duration,
//           price: record.price,
//           currency: record.currency,
//           isActive: record.isActive,
//           members: await getMembers(record._id),
//           created: record.createdAt,
//           updated: record.updatedAt,
//         })),
//       ),
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
//   "/plans",
//   body(upsertPlanBodySchema),
//   // (req, res, next) =>
//   // authorization("plan", req.body.id ? "canUpdate" : "canCreate")(
//   // req,
//   // res,
//   // next,
//   // ),
//   async (req, res) => {
//     if (req.body.id) {
//       const oldRecord = await PlanSchema.findOne({
//         _id: req.body.id,
//         // company: req.identity.company.id,
//       });

//       if (!oldRecord) {
//         return res.status(404).json({
//           message: "El plan solicitado no fue encontrado.",
//         });
//       }

//       if (oldRecord?.status && [].includes(oldRecord.status)) {
//         return res.status(409).json({
//           message: "El plan no puede ser modificado por su estado actual.",
//         });
//       }

//       await PlanSchema.findOneAndUpdate(
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
//         message: "El plan fue actualizado exitosamente.",
//       });
//     }

//     const record = await PlanSchema.create({
//       ...req.body,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "plan",
//     // });

//     return res.status(200).json({
//       id: String(record._id),
//       message: "El plan fue creado exitosamente.",
//     });
//   },
// );

// router.get(
//   "/plans/:id",
//   params(getPlanParamsSchema),
//   // authorization("plan", "canRead"),
//   async (req, res) => {
//     const record = await PlanSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     }).lean();

//     if (!record) {
//       return res.status(404).json({
//         message: "El plan solicitado no fue encontrado.",
//       });
//     }

//     return res.status(200).json({
//       id: String(record._id),
//       name: record.name,
//       description: record.description,
//       features: record.features,
//       duration: record.duration,
//       price: record.price,
//       currency: record.currency,
//       isActive: record.isActive,
//       created: record.createdAt,
//       updated: record.updatedAt,
//     });
//   },
// );

// router.delete(
//   "/plans/:id",
//   params(deletePlanParamsSchema),
//   // authorization("plan", "canDelete"),
//   async (req, res) => {
//     const record = await PlanSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     if (!record) {
//       return res.status(404).json({
//         message: "El plan solicitado no fue encontrado.",
//       });
//     }

//     if (record?.status && [].includes(record.status)) {
//       return res.status(409).json({
//         message: "El plan no puede ser modificado por su estado actual.",
//       });
//     }

//     // await canDelete({
//     //   Model: MembershipSchema,
//     //   key: "plan",
//     //   value: req.params.id,
//     //   // company: req.identity.company.id,
//     // });

//     await PlanSchema.deleteOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "plan",
//     // action: "remove",
//     // value: 1,
//     // });

//     return res.status(200).json({
//       message: "El plan fue eliminado exitosamente.",
//     });
//   },
// );

// module.exports = router;

const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const plans = [
  {
    id: "1",
    name: "Plan Mensual",
    duration: 30,
    price: 120,
    currency: "PEN",
    active: 3,
    benefits: [
      "Acceso a sala de pesas",
      "Clases grupales",
      "Casillero personal",
    ],
  },
  {
    id: "2",
    name: "Plan Trimestral",
    duration: 90,
    price: 320,
    currency: "PEN",
    active: 2,
    benefits: [
      "Todo lo del Plan Mensual",
      "Evaluación física inicial",
      "15% dcto. en suplementos",
    ],
  },
  {
    id: "3",
    name: "Plan Semestral",
    duration: 180,
    price: 560,
    currency: "PEN",
    active: 2,
    benefits: [
      "Todo lo del Plan Trimestral",
      "2 sesiones con entrenador",
      "Acceso a zona funcional",
    ],
  },
  {
    id: "4",
    name: "Plan Anual",
    duration: 365,
    price: 980,
    currency: "PEN",
    active: 5,
    benefits: [
      "Todo lo del Plan Semestral",
      "4 sesiones con entrenador",
      "Congelamiento de membresía por 15 días",
    ],
  },
];

router.get("/plans", async (req, res) => {
  await delay();

  return res.status(200).json(plans);
});

router.get("/plans/:id", async (req, res) => {
  await delay();

  return res.status(200).json(plans.find((plan) => plan.id === req.params.id));
});

router.post("/plans", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: req.body.id ? "PLAN_UPDATED" : "PLAN_CREATED",
  });
});

router.delete("/plans/:id", async (req, res) => {
  await delay();

  return res.status(200).json({
    message: "PLAN_DELETED",
  });
});

module.exports = router;
