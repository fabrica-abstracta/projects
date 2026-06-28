const router = require("express").Router();

const {
  ProductSchema,
} = require("../../schemas");

const {
  searchProductsQuerySchema,
  upsertProductBodySchema,
  getProductParamsSchema,
  deleteProductParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/products",
  query(searchProductsQuerySchema),
  // authorization("product", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.sku !== undefined && {
        sku: req.query.sku,
      }),
      ...(req.query.name !== undefined && {
        name: req.query.name,
      }),
      ...(req.query.description !== undefined && {
        description: req.query.description,
      }),
      ...(req.query.category !== undefined && {
        category: req.query.category,
      }),
      ...(req.query.brand !== undefined && {
        brand: req.query.brand,
      }),
      ...(req.query.stock !== undefined && {
        stock: req.query.stock,
      }),
      ...(req.query.alert !== undefined && {
        alert: req.query.alert,
      }),
      ...(req.query.price !== undefined && {
        price: req.query.price,
      }),
      ...(req.query.isActive !== undefined && {
        isActive: req.query.isActive,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      ProductSchema.find(filter)
        .populate({ path: "category" })
        .populate({ path: "brand" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ProductSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        sku: record.sku,
        name: record.name,
        description: record.description,
        ...(record.category && {
          category: record.category,
        }),
        ...(record.brand && {
          brand: record.brand,
        }),
        stock: record.stock,
        alert: record.alert,
        price: record.price,
        isActive: record.isActive,
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
  "/products",
  body(upsertProductBodySchema),
  // (req, res, next) =>
    // authorization("product", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await ProductSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El producto solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El producto no puede ser modificado por su estado actual.",
        });
      }

      await ProductSchema.findOneAndUpdate(
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
        message: "El producto fue actualizado exitosamente.",
      });
    }

    const record = await ProductSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "product",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El producto fue creado exitosamente.",
    });
  },
);

router.get(
  "/products/:id",
  params(getProductParamsSchema),
  // authorization("product", "canRead"),
  async (req, res) => {
    const record = await ProductSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "category" })
      .populate({ path: "brand" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El producto solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      sku: record.sku,
      name: record.name,
      description: record.description,
      ...(record.category && {
        category: record.category,
      }),
      ...(record.brand && {
        brand: record.brand,
      }),
      stock: record.stock,
      alert: record.alert,
      price: record.price,
      isActive: record.isActive,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/products/:id",
  params(deleteProductParamsSchema),
  // authorization("product", "canDelete"),
  async (req, res) => {
    const record = await ProductSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El producto solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El producto no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "product",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await ProductSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "product",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El producto fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
