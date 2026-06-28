const router = require("express").Router();

const {
  SessionSchema,
} = require("../../schemas");

const {
  searchSessionsQuerySchema,
  upsertSessionBodySchema,
  getSessionParamsSchema,
  deleteSessionParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/sessions",
  query(searchSessionsQuerySchema),
  // authorization("session", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.user !== undefined && {
        user: req.query.user,
      }),
      ...(req.query.device !== undefined && {
        device: req.query.device,
      }),
      ...(req.query.ip !== undefined && {
        ip: req.query.ip,
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
      SessionSchema.find(filter)
        .populate({ path: "user", populate: { path: "role" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      SessionSchema.countDocuments(filter),
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
        device: record.device,
        ip: record.ip,
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
  "/sessions",
  body(upsertSessionBodySchema),
  // (req, res, next) =>
    // authorization("session", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await SessionSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El session solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El session no puede ser modificado por su estado actual.",
        });
      }

      await SessionSchema.findOneAndUpdate(
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
        message: "El session fue actualizado exitosamente.",
      });
    }

    const record = await SessionSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "session",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El session fue creado exitosamente.",
    });
  },
);

router.get(
  "/sessions/:id",
  params(getSessionParamsSchema),
  // authorization("session", "canRead"),
  async (req, res) => {
    const record = await SessionSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "user", populate: { path: "role" } })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El session solicitado no fue encontrado.",
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
      device: record.device,
      ip: record.ip,
      expires: record.expires,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/sessions/:id",
  params(deleteSessionParamsSchema),
  // authorization("session", "canDelete"),
  async (req, res) => {
    const record = await SessionSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El session solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El session no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "session",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await SessionSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "session",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El session fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
