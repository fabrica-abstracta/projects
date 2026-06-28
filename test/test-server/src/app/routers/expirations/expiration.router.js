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
      ...(req.query.product !== undefined && {
        product: req.query.product,
      }),
      ...(req.query.description !== undefined && {
        description: req.query.description,
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
      ProductSchema.find(filter)
        .populate({ path: "product" })
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
        ...(record.product && {
          product: {
            id: String(record.product._id),
            sku: record.product.sku,
            name: record.product.name,
            description: record.product.description,
            category: record.product.category,
            brand: record.product.brand,
            stock: record.product.stock,
            alert: record.product.alert,
            price: record.product.price,
            isActive: record.product.isActive,
          },
        }),
        description: record.description,
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
      .populate({ path: "product" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El producto solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      ...(record.product && {
        product: {
          id: String(record.product._id),
          sku: record.product.sku,
          name: record.product.name,
          description: record.product.description,
          category: record.product.category,
          brand: record.product.brand,
          stock: record.product.stock,
          alert: record.product.alert,
          price: record.product.price,
          isActive: record.product.isActive,
        },
      }),
      description: record.description,
      expires: record.expires,
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
