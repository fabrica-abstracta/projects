const router = require("express").Router();

const {
  UserSchema,
} = require("../../schemas");

const {
  searchUsersQuerySchema,
  upsertUserBodySchema,
  getUserParamsSchema,
  deleteUserParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/users",
  query(searchUsersQuerySchema),
  // authorization("user", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.names !== undefined && {
        names: req.query.names,
      }),
      ...(req.query.email !== undefined && {
        email: req.query.email,
      }),
      ...(req.query.password !== undefined && {
        password: req.query.password,
      }),
      ...(req.query.role !== undefined && {
        role: req.query.role,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      UserSchema.find(filter)
        .populate({ path: "role" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      UserSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        names: record.names,
        email: record.email,
        password: record.password,
        ...(record.role && {
          role: {
            id: String(record.role._id),
            name: record.role.name,
            description: record.role.description,
            permissions: record.role.permissions,
          },
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
  "/users",
  body(upsertUserBodySchema),
  // (req, res, next) =>
    // authorization("user", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await UserSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El usuario solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El usuario no puede ser modificado por su estado actual.",
        });
      }

      await UserSchema.findOneAndUpdate(
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
        message: "El usuario fue actualizado exitosamente.",
      });
    }

    const record = await UserSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "user",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El usuario fue creado exitosamente.",
    });
  },
);

router.get(
  "/users/:id",
  params(getUserParamsSchema),
  // authorization("user", "canRead"),
  async (req, res) => {
    const record = await UserSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "role" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El usuario solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      names: record.names,
      email: record.email,
      password: record.password,
      ...(record.role && {
        role: {
          id: String(record.role._id),
          name: record.role.name,
          description: record.role.description,
          permissions: record.role.permissions,
        },
      }),
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/users/:id",
  params(deleteUserParamsSchema),
  // authorization("user", "canDelete"),
  async (req, res) => {
    const record = await UserSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El usuario solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El usuario no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "user",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await UserSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "user",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El usuario fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
