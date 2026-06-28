const router = require("express").Router();

const {
  PaymentSchema,
} = require("../../schemas");

const {
  searchPaymentsQuerySchema,
  upsertPaymentBodySchema,
  getPaymentParamsSchema,
  deletePaymentParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/payments",
  query(searchPaymentsQuerySchema),
  // authorization("payment", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.subscription !== undefined && {
        subscription: req.query.subscription,
      }),
      ...(req.query.user !== undefined && {
        user: req.query.user,
      }),
      ...(req.query.amount !== undefined && {
        amount: req.query.amount,
      }),
      ...(req.query.method !== undefined && {
        method: req.query.method,
      }),
      ...(req.query.status !== undefined && {
        status: req.query.status,
      }),
      ...(req.query.transaction !== undefined && {
        transaction: req.query.transaction,
      }),
      ...(req.query.evidence !== undefined && {
        evidence: req.query.evidence,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      PaymentSchema.find(filter)
        .populate({ path: "subscription", populate: { path: "user", populate: { path: "role" } } })
        .populate({ path: "user", populate: { path: "role" } })
        .populate({ path: "evidence" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      PaymentSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        ...(record.subscription && {
          subscription: {
            id: String(record.subscription._id),
            ...(record.subscription.user && {
              user: {
                id: String(record.subscription.user._id),
                names: record.subscription.user.names,
                email: record.subscription.user.email,
                password: record.subscription.user.password,
                ...(record.subscription.user.role && {
                  role: {
                    id: String(record.subscription.user.role._id),
                    name: record.subscription.user.role.name,
                    description: record.subscription.user.role.description,
                    permissions: record.subscription.user.role.permissions,
                  },
                }),
              },
            }),
            plan: record.subscription.plan,
            end: record.subscription.end,
          },
        }),
        ...(record.user && {
          user: {
            id: String(record.user._id),
            names: record.user.names,
            email: record.user.email,
            password: record.user.password,
            ...(record.user.role && {
              role: {
                id: String(record.user.role._id),
                name: record.user.role.name,
                description: record.user.role.description,
                permissions: record.user.role.permissions,
              },
            }),
          },
        }),
        amount: record.amount,
        method: record.method,
        status: record.status,
        transaction: record.transaction,
        ...(record.evidence && {
          evidence: record.evidence,
        }),
        created: record.createdAt,
        updated: record.updatedAt,
      })),
      pagination: {
        page,
        perPage: limit,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  },
);

router.post(
  "/payments",
  body(upsertPaymentBodySchema),
  // (req, res, next) =>
    // authorization("payment", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await PaymentSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El pago solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && ["completed"].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El pago no puede ser modificado por su estado actual.",
        });
      }

      await PaymentSchema.findOneAndUpdate(
        {
          _id: req.body.id,
          // company: req.identity.company.id,
        },
        {
          $set: req.body,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      return res.status(200).json({
        message: "El pago fue actualizado exitosamente.",
      });
    }

    const record = await PaymentSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "payment",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El pago fue creado exitosamente.",
    });
  },
);

router.get(
  "/payments/:id",
  params(getPaymentParamsSchema),
  // authorization("payment", "canRead"),
  async (req, res) => {
    const record = await PaymentSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "subscription", populate: { path: "user", populate: { path: "role" } } })
      .populate({ path: "user", populate: { path: "role" } })
      .populate({ path: "evidence" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El pago solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      ...(record.subscription && {
        subscription: {
          id: String(record.subscription._id),
          ...(record.subscription.user && {
            user: {
              id: String(record.subscription.user._id),
              names: record.subscription.user.names,
              email: record.subscription.user.email,
              password: record.subscription.user.password,
              ...(record.subscription.user.role && {
                role: {
                  id: String(record.subscription.user.role._id),
                  name: record.subscription.user.role.name,
                  description: record.subscription.user.role.description,
                  permissions: record.subscription.user.role.permissions,
                },
              }),
            },
          }),
          plan: record.subscription.plan,
          end: record.subscription.end,
        },
      }),
      ...(record.user && {
        user: {
          id: String(record.user._id),
          names: record.user.names,
          email: record.user.email,
          password: record.user.password,
          ...(record.user.role && {
            role: {
              id: String(record.user.role._id),
              name: record.user.role.name,
              description: record.user.role.description,
              permissions: record.user.role.permissions,
            },
          }),
        },
      }),
      amount: record.amount,
      method: record.method,
      status: record.status,
      transaction: record.transaction,
      ...(record.evidence && {
        evidence: record.evidence,
      }),
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/payments/:id",
  params(deletePaymentParamsSchema),
  // authorization("payment", "canDelete"),
  async (req, res) => {
    const record = await PaymentSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El pago solicitado no fue encontrado.",
      });
    }

    if (record?.status && ["completed"].includes(record.status)) {
      return res.status(409).json({
        message: "El pago no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "payment",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await PaymentSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "payment",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El pago fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
