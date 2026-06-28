const router = require("express").Router();

const {
  CustomerSchema,
} = require("../../schemas");

const {
  searchCustomersQuerySchema,
  upsertCustomerBodySchema,
  getCustomerParamsSchema,
  deleteCustomerParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/customers",
  query(searchCustomersQuerySchema),
  // authorization("customer", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.user !== undefined && {
        user: req.query.user,
      }),
      ...(req.query.slug !== undefined && {
        slug: req.query.slug,
      }),
      ...(req.query.document !== undefined && {
        document: req.query.document,
      }),
      ...(req.query.number !== undefined && {
        number: req.query.number,
      }),
      ...(req.query.names !== undefined && {
        names: req.query.names,
      }),
      ...(req.query.phone !== undefined && {
        phone: req.query.phone,
      }),
      ...(req.query.email !== undefined && {
        email: req.query.email,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      CustomerSchema.find(filter)
        .populate({ path: "user", populate: { path: "role" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      CustomerSchema.countDocuments(filter),
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
        slug: record.slug,
        document: record.document,
        number: record.number,
        names: record.names,
        phone: record.phone,
        email: record.email,
        schedule: record.schedule,
        closedDates: record.closedDates,
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
  "/customers",
  body(upsertCustomerBodySchema),
  // (req, res, next) =>
    // authorization("customer", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await CustomerSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El cliente solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El cliente no puede ser modificado por su estado actual.",
        });
      }

      await CustomerSchema.findOneAndUpdate(
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
        message: "El cliente fue actualizado exitosamente.",
      });
    }

    const record = await CustomerSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "customer",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El cliente fue creado exitosamente.",
    });
  },
);

router.get(
  "/customers/:id",
  params(getCustomerParamsSchema),
  // authorization("customer", "canRead"),
  async (req, res) => {
    const record = await CustomerSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "user", populate: { path: "role" } })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El cliente solicitado no fue encontrado.",
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
      slug: record.slug,
      document: record.document,
      number: record.number,
      names: record.names,
      phone: record.phone,
      email: record.email,
      schedule: record.schedule,
      closedDates: record.closedDates,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/customers/:id",
  params(deleteCustomerParamsSchema),
  // authorization("customer", "canDelete"),
  async (req, res) => {
    const record = await CustomerSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El cliente solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El cliente no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "customer",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await CustomerSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "customer",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El cliente fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
