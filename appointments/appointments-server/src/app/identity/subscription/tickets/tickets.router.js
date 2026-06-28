const router = require("express").Router();

const { TicketsSchema } = require("../../../schemas");

const {
  searchTicketsQuerySchema,
  upsertTicketsBodySchema,
  getTicketsParamsSchema,
  deleteTicketsParamsSchema,
} = require("../../../validators");

const { body, query, params } = require("../../../config/validator");

router.get(
  "/tickets",
  query(searchTicketsQuerySchema),
  // authorization("tickets", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      TicketsSchema.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      TicketsSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
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
  "/tickets",
  body(upsertTicketsBodySchema),
  // (req, res, next) =>
  // authorization("tickets", req.body.id ? "canUpdate" : "canCreate")(
  // req,
  // res,
  // next,
  // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await TicketsSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El tickets solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El tickets no puede ser modificado por su estado actual.",
        });
      }

      await TicketsSchema.findOneAndUpdate(
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
        message: "El tickets fue actualizado exitosamente.",
      });
    }

    const record = await TicketsSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "tickets",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El tickets fue creado exitosamente.",
    });
  },
);

router.get(
  "/tickets/:id",
  params(getTicketsParamsSchema),
  // authorization("tickets", "canRead"),
  async (req, res) => {
    const record = await TicketsSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    }).lean();

    if (!record) {
      return res.status(404).json({
        message: "El tickets solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/tickets/:id",
  params(deleteTicketsParamsSchema),
  // authorization("tickets", "canDelete"),
  async (req, res) => {
    const record = await TicketsSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El tickets solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El tickets no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "tickets",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await TicketsSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "tickets",
    // action: "remove",
    // value: 1,
    // });

    return res.status(200).json({
      message: "El tickets fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
