// const router = require("express").Router();

// const { CustomerSchema } = require("../../schemas");

// const {
//   searchCustomersQuerySchema,
//   upsertCustomerBodySchema,
//   getCustomerParamsSchema,
//   deleteCustomerParamsSchema,
// } = require("./customer.validator");

// const { body, query, params } = require("../../config/validator");

// router.get(
//   "/customers",
//   query(searchCustomersQuerySchema),
//   // authorization("customer", "canSearch"),
//   async (req, res) => {
//     const filter = {
//       // company: req.identity.company.id,
//       ...(req.query.document !== undefined && {
//         document: req.query.document,
//       }),
//       ...(req.query.names !== undefined && {
//         names: req.query.names,
//       }),
//       ...(req.query.birthdate && {
//         birthdate: {
//           ...(req.query.birthdate.from && {
//             $gte: req.query.birthdate.from,
//           }),
//           ...(req.query.birthdate.to && {
//             $lte: req.query.birthdate.to,
//           }),
//         },
//       }),
//       ...(req.query.gender !== undefined && {
//         gender: req.query.gender,
//       }),
//       ...(req.query.email !== undefined && {
//         contact: req.query.email,
//       }),
//     };

//     const skip = (req.query.page - 1) * req.query.perPage;
//     const limit = req.query.perPage;

//     const [items, totalItems] = await Promise.all([
//       CustomerSchema.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       CustomerSchema.countDocuments(filter),
//     ]);

//     const totalPages = Math.ceil(totalItems / limit);
//     const page = Math.floor(skip / limit) + 1;

//     return res.status(200).json({
//       data: items.map((record) => ({
//         id: String(record._id),
//         document: record.document,
//         number: record.number,
//         paternal: record.paternal,
//         maternal: record.maternal,
//         names: record.names,
//         birthdate: record.birthdate,
//         gender: record.gender,
//         phone: record.phone,
//         email: record.email,
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
//   "/customers",
//   body(upsertCustomerBodySchema),
//   // (req, res, next) =>
//   // authorization("customer", req.body.id ? "canUpdate" : "canCreate")(
//   // req,
//   // res,
//   // next,
//   // ),
//   async (req, res) => {
//     if (req.body.id) {
//       const oldRecord = await CustomerSchema.findOne({
//         _id: req.body.id,
//         // company: req.identity.company.id,
//       });

//       if (!oldRecord) {
//         return res.status(404).json({
//           message: "El cliente solicitado no fue encontrado.",
//         });
//       }

//       if (oldRecord?.status && [].includes(oldRecord.status)) {
//         return res.status(409).json({
//           message: "El cliente no puede ser modificado por su estado actual.",
//         });
//       }

//       await CustomerSchema.findOneAndUpdate(
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
//         message: "El cliente fue actualizado exitosamente.",
//       });
//     }

//     const record = await CustomerSchema.create({
//       ...req.body,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "customer",
//     // });

//     return res.status(200).json({
//       id: String(record._id),
//       message: "El cliente fue creado exitosamente.",
//     });
//   },
// );

// router.get(
//   "/customers/:id",
//   params(getCustomerParamsSchema),
//   // authorization("customer", "canRead"),
//   async (req, res) => {
//     const record = await CustomerSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     }).lean();

//     if (!record) {
//       return res.status(404).json({
//         message: "El cliente solicitado no fue encontrado.",
//       });
//     }

//     return res.status(200).json({
//       id: String(record._id),
//       document: record.document,
//       number: record.number,
//       paternal: record.paternal,
//       maternal: record.maternal,
//       names: record.names,
//       birthdate: record.birthdate,
//       gender: record.gender,
//       phone: record.phone,
//       email: record.email,
//       created: record.createdAt,
//       updated: record.updatedAt,
//     });
//   },
// );

// router.delete(
//   "/customers/:id",
//   params(deleteCustomerParamsSchema),
//   // authorization("customer", "canDelete"),
//   async (req, res) => {
//     const record = await CustomerSchema.findOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     if (!record) {
//       return res.status(404).json({
//         message: "El cliente solicitado no fue encontrado.",
//       });
//     }

//     if (record?.status && [].includes(record.status)) {
//       return res.status(409).json({
//         message: "El cliente no puede ser modificado por su estado actual.",
//       });
//     }

//     // await canDelete({
//     //   Model: null,
//     //   key: "customer",
//     //   value: req.params.id,
//     //   // company: req.identity.company.id,
//     // });

//     await CustomerSchema.deleteOne({
//       _id: req.params.id,
//       // company: req.identity.company.id,
//     });

//     // await usage({
//     // company: req.identity.company.id,
//     // subscription: req.identity.subscription.id,
//     // key: "customer",
//     // action: "remove",
//     // value: 1,
//     // });

//     return res.status(200).json({
//       message: "El cliente fue eliminado exitosamente.",
//     });
//   },
// );

// module.exports = router;

const router = require("express").Router();

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/clients", async (req, res) => {
  await delay();

  return res.status(200).json([
    {
      id: "1",
      name: "Diego Ramírez Soto",
      phone: "987 654 321",
      email: "diego.ramirez@gmail.com",
      status: "expiring",
      lastPlan: "Plan Mensual",
      plan: {
        name: "Plan Mensual",
        start: "01/06/2026",
        expires: "30/06/2026",
      },
    },
    {
      id: "2",
      name: "Valentina Cruz Paredes",
      phone: "956 213 478",
      email: "valentina.cruzp@gmail.com",
      status: "active",
      lastPlan: "Plan Trimestral",
      plan: {
        name: "Plan Trimestral",
        start: "15/05/2026",
        expires: "15/08/2026",
      },
    },
    {
      id: "3",
      name: "Camila Torres Vega",
      phone: "978 332 110",
      email: "camila.torresv@gmail.com",
      status: "expired",
      lastPlan: "Plan Mensual",
      plan: {
        name: "Plan Mensual",
        start: "01/05/2026",
        expires: "31/05/2026",
      },
    },
    {
      id: "4",
      name: "Mateo Fernández Ruiz",
      phone: "945 110 982",
      email: "mfernandez.ruiz@hotmail.com",
      status: "none",
      lastPlan: "Plan Anual",
      plan: null,
    },
    {
      id: "5",
      name: "Luciana Herrera Quispe",
      phone: "933 882 100",
      email: "luciana.herrera@gmail.com",
      status: "active",
      lastPlan: "Plan Semestral",
      plan: {
        name: "Plan Semestral",
        start: "10/04/2026",
        expires: "10/10/2026",
      },
    },
    {
      id: "6",
      name: "Andrés Pinedo Vargas",
      phone: "901 220 778",
      email: "andres.pinedo@gmail.com",
      status: "none",
      lastPlan: "Plan Mensual",
      plan: null,
    },
    {
      id: "7",
      name: "Renata Salazar Molina",
      phone: "944 777 120",
      email: "renata.salazar@gmail.com",
      status: "active",
      lastPlan: "Plan Mensual",
      plan: {
        name: "Plan Mensual",
        start: "05/06/2026",
        expires: "05/07/2026",
      },
    },
    {
      id: "8",
      name: "Bruno Castillo León",
      phone: "988 441 220",
      email: "bruno.castillo@gmail.com",
      status: "expiring",
      lastPlan: "Plan Mensual",
      plan: {
        name: "Plan Mensual",
        start: "28/05/2026",
        expires: "28/06/2026",
      },
    },
    {
      id: "9",
      name: "Mariana Rojas Campos",
      phone: "955 200 889",
      email: "mariana.rojas@gmail.com",
      status: "expired",
      lastPlan: "Plan Trimestral",
      plan: {
        name: "Plan Trimestral",
        start: "01/03/2026",
        expires: "01/06/2026",
      },
    },
    {
      id: "10",
      name: "Santiago Vargas Flores",
      phone: "922 345 800",
      email: "santiago.vargas@gmail.com",
      status: "active",
      lastPlan: "Plan Anual",
      plan: {
        name: "Plan Anual",
        start: "20/01/2026",
        expires: "20/01/2027",
      },
    },
  ]);
});

module.exports = router;
