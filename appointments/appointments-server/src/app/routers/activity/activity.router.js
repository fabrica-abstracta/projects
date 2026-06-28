const router = require("express").Router();

const { ActivitySchema } = require("../../schemas");

const {
  searchActivitiesQuerySchema,
  upsertActivityBodySchema,
  getActivityParamsSchema,
  deleteActivityParamsSchema,
} = require("../../validators");

const { body, query, params } = require("../../config/validator");

router.get(
  "/activities",
  query(searchActivitiesQuerySchema),
  // authorization("activity", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.type !== undefined && {
        type: req.query.type,
      }),
      ...(req.query.user !== undefined && {
        user: req.query.user,
      }),
      ...(req.query.customer !== undefined && {
        customer: req.query.customer,
      }),
      ...(req.query.summary !== undefined && {
        summary: req.query.summary,
      }),
      ...(req.query.description !== undefined && {
        description: req.query.description,
      }),
      ...(req.query.total !== undefined && {
        total: req.query.total,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      ActivitySchema.find(filter)
        .populate({ path: "user", populate: { path: "role" } })
        .populate({
          path: "customer",
          populate: { path: "user", populate: { path: "role" } },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ActivitySchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        type: record.type,
        ...(record.user && {
          user: {
            id: String(record.user._id),
            names: record.user.names,
            email: record.user.email,
            password: record.user.password,
            ...(record.user.role && {
              role: {
                id: String(record.user.role._id),
              },
            }),
          },
        }),
        ...(record.customer && {
          customer: {
            id: String(record.customer._id),
            ...(record.customer.user && {
              user: {
                id: String(record.customer.user._id),
                names: record.customer.user.names,
                email: record.customer.user.email,
                password: record.customer.user.password,
                ...(record.customer.user.role && {
                  role: {
                    id: String(record.customer.user.role._id),
                  },
                }),
              },
            }),
            slug: record.customer.slug,
            number: record.customer.number,
            names: record.customer.names,
            phone: record.customer.phone,
            email: record.customer.email,
            schedule: record.customer.schedule,
            closedDates: record.customer.closedDates,
          },
        }),
        summary: record.summary,
        description: record.description,
        total: record.total,
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
  "/activities",
  body(upsertActivityBodySchema),
  // (req, res, next) =>
  // authorization("activity", req.body.id ? "canUpdate" : "canCreate")(
  // req,
  // res,
  // next,
  // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await ActivitySchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El activity solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El activity no puede ser modificado por su estado actual.",
        });
      }

      await ActivitySchema.findOneAndUpdate(
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
        message: "El activity fue actualizado exitosamente.",
      });
    }

    const record = await ActivitySchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "activity",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El activity fue creado exitosamente.",
    });
  },
);

router.get(
  "/activities/:id",
  params(getActivityParamsSchema),
  // authorization("activity", "canRead"),
  async (req, res) => {
    const record = await ActivitySchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "user", populate: { path: "role" } })
      .populate({
        path: "customer",
        populate: { path: "user", populate: { path: "role" } },
      })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El activity solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      type: record.type,
      ...(record.user && {
        user: {
          id: String(record.user._id),
          names: record.user.names,
          email: record.user.email,
          password: record.user.password,
          ...(record.user.role && {
            role: {
              id: String(record.user.role._id),
            },
          }),
        },
      }),
      ...(record.customer && {
        customer: {
          id: String(record.customer._id),
          ...(record.customer.user && {
            user: {
              id: String(record.customer.user._id),
              names: record.customer.user.names,
              email: record.customer.user.email,
              password: record.customer.user.password,
              ...(record.customer.user.role && {
                role: {
                  id: String(record.customer.user.role._id),
                },
              }),
            },
          }),
          slug: record.customer.slug,
          number: record.customer.number,
          names: record.customer.names,
          phone: record.customer.phone,
          email: record.customer.email,
          schedule: record.customer.schedule,
          closedDates: record.customer.closedDates,
        },
      }),
      summary: record.summary,
      description: record.description,
      total: record.total,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/activities/:id",
  params(deleteActivityParamsSchema),
  // authorization("activity", "canDelete"),
  async (req, res) => {
    const record = await ActivitySchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El activity solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El activity no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "activity",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await ActivitySchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "activity",
    // action: "remove",
    // value: 1,
    // });

    return res.status(200).json({
      message: "El activity fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
