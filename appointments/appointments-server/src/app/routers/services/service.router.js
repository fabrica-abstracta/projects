const router = require("express").Router();

const { ServiceSchema } = require("../../schemas");

const {
  searchServicesQuerySchema,
  upsertServiceBodySchema,
  getServiceParamsSchema,
  deleteServiceParamsSchema,
} = require("../../validators");

const { body, query, params } = require("../../config/validator");

router.get(
  "/services",
  query(searchServicesQuerySchema),
  // authorization("service", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.name !== undefined && {
        name: req.query.name,
      }),
      ...(req.query.description !== undefined && {
        description: req.query.description,
      }),
      ...(req.query.price !== undefined && {
        price: req.query.price,
      }),
      ...(req.query.duration !== undefined && {
        duration: req.query.duration,
      }),
      ...(req.query.icon !== undefined && {
        icon: req.query.icon,
      }),
      ...(req.query.color !== undefined && {
        color: req.query.color,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      ServiceSchema.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ServiceSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        name: record.name,
        description: record.description,
        price: record.price,
        duration: record.duration,
        icon: record.icon,
        color: record.color,
        // created: record.createdAt,
        // updated: record.updatedAt,
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
  "/services",
  body(upsertServiceBodySchema),
  // (req, res, next) =>
  // authorization("service", req.body.id ? "canUpdate" : "canCreate")(
  // req,
  // res,
  // next,
  // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await ServiceSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El service solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El service no puede ser modificado por su estado actual.",
        });
      }

      await ServiceSchema.findOneAndUpdate(
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
        message: "El service fue actualizado exitosamente.",
      });
    }

    const record = await ServiceSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "service",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El service fue creado exitosamente.",
    });
  },
);

router.get(
  "/services/:id",
  params(getServiceParamsSchema),
  // authorization("service", "canRead"),
  async (req, res) => {
    const record = await ServiceSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    }).lean();

    if (!record) {
      return res.status(404).json({
        message: "El service solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      name: record.name,
      description: record.description,
      price: record.price,
      duration: record.duration,
      icon: record.icon,
      color: record.color,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/services/:id",
  params(deleteServiceParamsSchema),
  // authorization("service", "canDelete"),
  async (req, res) => {
    const record = await ServiceSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El service solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El service no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "service",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await ServiceSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "service",
    // action: "remove",
    // value: 1,
    // });

    return res.status(200).json({
      message: "El service fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
