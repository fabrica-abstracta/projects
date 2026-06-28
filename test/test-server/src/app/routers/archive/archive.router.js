const router = require("express").Router();

const {
  ArchiveSchema,
} = require("../../schemas");

const {
  searchArchivesQuerySchema,
  upsertArchiveBodySchema,
  getArchiveParamsSchema,
  deleteArchiveParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/archives",
  query(searchArchivesQuerySchema),
  // authorization("archive", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.bucket !== undefined && {
        bucket: req.query.bucket,
      }),
      ...(req.query.object !== undefined && {
        object: req.query.object,
      }),
      ...(req.query.name !== undefined && {
        name: req.query.name,
      }),
      ...(req.query.mime !== undefined && {
        mime: req.query.mime,
      }),
      ...(req.query.size !== undefined && {
        size: req.query.size,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      ArchiveSchema.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ArchiveSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        bucket: record.bucket,
        object: record.object,
        name: record.name,
        mime: record.mime,
        size: record.size,
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
  "/archives",
  body(upsertArchiveBodySchema),
  // (req, res, next) =>
    // authorization("archive", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await ArchiveSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El archive solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El archive no puede ser modificado por su estado actual.",
        });
      }

      await ArchiveSchema.findOneAndUpdate(
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
        message: "El archive fue actualizado exitosamente.",
      });
    }

    const record = await ArchiveSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "archive",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El archive fue creado exitosamente.",
    });
  },
);

router.get(
  "/archives/:id",
  params(getArchiveParamsSchema),
  // authorization("archive", "canRead"),
  async (req, res) => {
    const record = await ArchiveSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El archive solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      bucket: record.bucket,
      object: record.object,
      name: record.name,
      mime: record.mime,
      size: record.size,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/archives/:id",
  params(deleteArchiveParamsSchema),
  // authorization("archive", "canDelete"),
  async (req, res) => {
    const record = await ArchiveSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El archive solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El archive no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "archive",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await ArchiveSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "archive",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El archive fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
