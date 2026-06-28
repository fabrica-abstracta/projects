const router = require("express").Router();

const {
  SubscriptionSchema,
} = require("../../schemas");

const {
  searchSubscriptionsQuerySchema,
  upsertSubscriptionBodySchema,
  getSubscriptionParamsSchema,
  deleteSubscriptionParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/subscriptions",
  query(searchSubscriptionsQuerySchema),
  // authorization("subscription", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.user !== undefined && {
        user: req.query.user,
      }),
      ...(req.query.end && {
        end: {
          ...(req.query.end.from && {
            $gte: req.query.end.from,
          }),
          ...(req.query.end.to && {
            $lte: req.query.end.to,
          }),
        },
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      SubscriptionSchema.find(filter)
        .populate({ path: "user", populate: { path: "role" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      SubscriptionSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
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
        plan: record.plan,
        end: record.end,
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
  "/subscriptions",
  body(upsertSubscriptionBodySchema),
  // (req, res, next) =>
    // authorization("subscription", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await SubscriptionSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "La suscripción solicitada no fue encontrada.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "La suscripción no puede ser modificada por su estado actual.",
        });
      }

      await SubscriptionSchema.findOneAndUpdate(
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
        message: "La suscripción fue actualizada exitosamente.",
      });
    }

    const record = await SubscriptionSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "subscription",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "La suscripción fue creada exitosamente.",
    });
  },
);

router.get(
  "/subscriptions/:id",
  params(getSubscriptionParamsSchema),
  // authorization("subscription", "canRead"),
  async (req, res) => {
    const record = await SubscriptionSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "user", populate: { path: "role" } })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "La suscripción solicitada no fue encontrada.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
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
      plan: record.plan,
      end: record.end,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/subscriptions/:id",
  params(deleteSubscriptionParamsSchema),
  // authorization("subscription", "canDelete"),
  async (req, res) => {
    const record = await SubscriptionSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "La suscripción solicitada no fue encontrada.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "La suscripción no puede ser modificada por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "subscription",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await SubscriptionSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "subscription",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "La suscripción fue eliminada exitosamente.",
    });
  },
);

module.exports = router;
