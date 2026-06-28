const router = require("express").Router();

const {
  TicketSchema,
} = require("../../schemas");

const {
  searchTicketsQuerySchema,
  upsertTicketBodySchema,
  getTicketParamsSchema,
  deleteTicketParamsSchema,
} = require("../../validators");

const {
  body,
  query,
  params,
} = require("../../config/validator");

router.get(
  "/tickets",
  query(searchTicketsQuerySchema),
  // authorization("ticket", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.description !== undefined && {
        description: req.query.description,
      }),
      ...(req.query.type !== undefined && {
        type: req.query.type,
      }),
      ...(req.query.archive !== undefined && {
        archive: req.query.archive,
      }),
      ...(req.query.response !== undefined && {
        response: req.query.response,
      }),
      ...(req.query.support && {
        support: {
          ...(req.query.support.from && {
            $gte: req.query.support.from,
          }),
          ...(req.query.support.to && {
            $lte: req.query.support.to,
          }),
        },
      }),
      ...(req.query.status !== undefined && {
        status: req.query.status,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      TicketSchema.find(filter)
        .populate({ path: "archive" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      TicketSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        description: record.description,
        type: record.type,
        ...(record.archive && {
          archive: {
            id: String(record.archive._id),
            bucket: record.archive.bucket,
            object: record.archive.object,
            name: record.archive.name,
            mime: record.archive.mime,
            size: record.archive.size,
          },
        }),
        response: record.response,
        support: record.support,
        status: record.status,
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
  body(upsertTicketBodySchema),
  // (req, res, next) =>
    // authorization("ticket", req.body.id ? "canUpdate" : "canCreate")(
      // req,
      // res,
      // next,
    // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await TicketSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El ticket solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El ticket no puede ser modificado por su estado actual.",
        });
      }

      await TicketSchema.findOneAndUpdate(
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
        message: "El ticket fue actualizado exitosamente.",
      });
    }

    const record = await TicketSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "ticket",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El ticket fue creado exitosamente.",
    });
  },
);

router.get(
  "/tickets/:id",
  params(getTicketParamsSchema),
  // authorization("ticket", "canRead"),
  async (req, res) => {
    const record = await TicketSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "archive" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El ticket solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      description: record.description,
      type: record.type,
      ...(record.archive && {
        archive: {
          id: String(record.archive._id),
          bucket: record.archive.bucket,
          object: record.archive.object,
          name: record.archive.name,
          mime: record.archive.mime,
          size: record.archive.size,
        },
      }),
      response: record.response,
      support: record.support,
      status: record.status,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/tickets/:id",
  params(deleteTicketParamsSchema),
  // authorization("ticket", "canDelete"),
  async (req, res) => {
    const record = await TicketSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El ticket solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El ticket no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "ticket",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await TicketSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
      // company: req.identity.company.id,
      // subscription: req.identity.subscription.id,
      // key: "ticket",
      // action: "remove",
      // value: 1,
    // });

    return res.status(200).json({
      message: "El ticket fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
