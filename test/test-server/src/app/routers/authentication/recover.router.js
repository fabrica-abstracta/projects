const router = require("express").Router();

const {
  RecoverySchema,
} = require("../../schemas");

const {
  searchRecoveriesQuerySchema,
  upsertRecoveryBodySchema,
  getRecoveryParamsSchema,
  deleteRecoveryParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/recoveries",
  query(searchRecoveriesQuerySchema),
  // authorization("recovery", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.user !== undefined && {
        user: req.query.user,
      }),
      ...(req.query.code !== undefined && {
        code: req.query.code,
      }),
      ...(req.query.expires && {
        expires: {
          ...(req.query.expires.from && {
            $gte: req.query.expires.from,
          }),
          ...(req.query.expires.to && {
            $lte: req.query.expires.to,
          }),
        },
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      RecoverySchema.find(filter)
        .populate({ path: "user", populate: { path: "role" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      RecoverySchema.countDocuments(filter),
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
        code: record.code,
        expires: record.expires,
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
  "/recoveries",
  body(upsertRecoveryBodySchema),
  // (req, res, next) =>
    // authorization("recovery", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await RecoverySchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El recovery solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El recovery no puede ser modificado por su estado actual.",
        });
      }

      await RecoverySchema.findOneAndUpdate(
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
        message: "El recovery fue actualizado exitosamente.",
      });
    }

    const record = await RecoverySchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "recovery",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El recovery fue creado exitosamente.",
    });
  },
);

router.get(
  "/recoveries/:id",
  params(getRecoveryParamsSchema),
  // authorization("recovery", "canRead"),
  async (req, res) => {
    const record = await RecoverySchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "user", populate: { path: "role" } })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El recovery solicitado no fue encontrado.",
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
      code: record.code,
      expires: record.expires,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/recoveries/:id",
  params(deleteRecoveryParamsSchema),
  // authorization("recovery", "canDelete"),
  async (req, res) => {
    const record = await RecoverySchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El recovery solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El recovery no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "recovery",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await RecoverySchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "recovery",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El recovery fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
