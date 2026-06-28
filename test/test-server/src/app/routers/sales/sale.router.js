const router = require("express").Router();

const {
  SaleSchema,
} = require("../../schemas");

const {
  searchSalesQuerySchema,
  upsertSaleBodySchema,
  getSaleParamsSchema,
  deleteSaleParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/sales",
  query(searchSalesQuerySchema),
  // authorization("sale", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.type !== undefined && {
        type: req.query.type,
      }),
      ...(req.query.customer !== undefined && {
        customer: req.query.customer,
      }),
      ...(req.query.description !== undefined && {
        description: req.query.description,
      }),
      ...(req.query.total !== undefined && {
        total: req.query.total,
      }),
      ...(req.query.method !== undefined && {
        method: req.query.method,
      }),
      ...(req.query.reference !== undefined && {
        reference: req.query.reference,
      }),
      ...(req.query.evidence !== undefined && {
        evidence: req.query.evidence,
      }),
      ...(req.query.date && {
        date: {
          ...(req.query.date.from && {
            $gte: req.query.date.from,
          }),
          ...(req.query.date.to && {
            $lte: req.query.date.to,
          }),
        },
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      SaleSchema.find(filter)
        .populate({ path: "customer", populate: { path: "user", populate: { path: "role" } } })
        .populate({ path: "evidence" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      SaleSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        type: record.type,
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
                    name: record.customer.user.role.name,
                    description: record.customer.user.role.description,
                    permissions: record.customer.user.role.permissions,
                  },
                }),
              },
            }),
            slug: record.customer.slug,
            document: record.customer.document,
            number: record.customer.number,
            names: record.customer.names,
            phone: record.customer.phone,
            email: record.customer.email,
            schedule: record.customer.schedule,
            closedDates: record.customer.closedDates,
          },
        }),
        description: record.description,
        products: record.products,
        total: record.total,
        method: record.method,
        reference: record.reference,
        ...(record.evidence && {
          evidence: record.evidence,
        }),
        date: record.date,
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
  "/sales",
  body(upsertSaleBodySchema),
  // (req, res, next) =>
    // authorization("sale", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await SaleSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "La venta solicitada no fue encontrada.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "La venta no puede ser modificada por su estado actual.",
        });
      }

      await SaleSchema.findOneAndUpdate(
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
        message: "La venta fue actualizada exitosamente.",
      });
    }

    const record = await SaleSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "sale",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "La venta fue creada exitosamente.",
    });
  },
);

router.get(
  "/sales/:id",
  params(getSaleParamsSchema),
  // authorization("sale", "canRead"),
  async (req, res) => {
    const record = await SaleSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "customer", populate: { path: "user", populate: { path: "role" } } })
      .populate({ path: "evidence" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "La venta solicitada no fue encontrada.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      type: record.type,
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
                  name: record.customer.user.role.name,
                  description: record.customer.user.role.description,
                  permissions: record.customer.user.role.permissions,
                },
              }),
            },
          }),
          slug: record.customer.slug,
          document: record.customer.document,
          number: record.customer.number,
          names: record.customer.names,
          phone: record.customer.phone,
          email: record.customer.email,
          schedule: record.customer.schedule,
          closedDates: record.customer.closedDates,
        },
      }),
      description: record.description,
      products: record.products,
      total: record.total,
      method: record.method,
      reference: record.reference,
      ...(record.evidence && {
        evidence: record.evidence,
      }),
      date: record.date,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/sales/:id",
  params(deleteSaleParamsSchema),
  // authorization("sale", "canDelete"),
  async (req, res) => {
    const record = await SaleSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "La venta solicitada no fue encontrada.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "La venta no puede ser modificada por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "sale",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await SaleSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "sale",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "La venta fue eliminada exitosamente.",
    });
  },
);

module.exports = router;
