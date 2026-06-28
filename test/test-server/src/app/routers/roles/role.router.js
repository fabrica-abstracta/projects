const router = require("express").Router();

const {
  RoleSchema,
} = require("../../schemas");

const {
  searchRolesQuerySchema,
  upsertRoleBodySchema,
  getRoleParamsSchema,
  deleteRoleParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/roles",
  query(searchRolesQuerySchema),
  // authorization("role", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.name !== undefined && {
        name: req.query.name,
      }),
      ...(req.query.description !== undefined && {
        description: req.query.description,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      RoleSchema.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      RoleSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        name: record.name,
        description: record.description,
        permissions: record.permissions,
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
  "/roles",
  body(upsertRoleBodySchema),
  // (req, res, next) =>
    // authorization("role", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await RoleSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El rol solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El rol no puede ser modificado por su estado actual.",
        });
      }

      await RoleSchema.findOneAndUpdate(
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
        message: "El rol fue actualizado exitosamente.",
      });
    }

    const record = await RoleSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "role",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El rol fue creado exitosamente.",
    });
  },
);

router.get(
  "/roles/:id",
  params(getRoleParamsSchema),
  // authorization("role", "canRead"),
  async (req, res) => {
    const record = await RoleSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El rol solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      name: record.name,
      description: record.description,
      permissions: record.permissions,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/roles/:id",
  params(deleteRoleParamsSchema),
  // authorization("role", "canDelete"),
  async (req, res) => {
    const record = await RoleSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El rol solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El rol no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "role",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await RoleSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "role",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El rol fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
