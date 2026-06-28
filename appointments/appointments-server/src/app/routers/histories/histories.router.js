const router = require("express").Router();

const { HistorySchema } = require("../../schemas");

const {
  searchHistoriesQuerySchema,
  upsertHistoryBodySchema,
  getHistoryParamsSchema,
  deleteHistoryParamsSchema,
} = require("../../validators");

const { body, query, params } = require("../../config/validator");

router.get(
  "/histories",
  query(searchHistoriesQuerySchema),
  // authorization("history", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.appointment !== undefined && {
        appointment: req.query.appointment,
      }),
      ...(req.query.patient !== undefined && {
        patient: req.query.patient,
      }),
      ...(req.query.professional !== undefined && {
        professional: req.query.professional,
      }),
      ...(req.query.description !== undefined && {
        description: req.query.description,
      }),
      ...(req.query.diagnosis !== undefined && {
        diagnosis: req.query.diagnosis,
      }),
      ...(req.query.treatment !== undefined && {
        treatment: req.query.treatment,
      }),
      ...(req.query.observations !== undefined && {
        observations: req.query.observations,
      }),
      ...(req.query.status !== undefined && {
        status: req.query.status,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      HistorySchema.find(filter)
        .populate({
          path: "appointment",
          populate: [
            { path: "patient" },
            { path: "professional", populate: { path: "role" } },
            { path: "service" },
          ],
        })
        .populate({ path: "patient" })
        .populate({ path: "professional" })
        .populate({ path: "archives" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      HistorySchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        ...(record.appointment && {
          // appointment: {
          id: String(record.appointment._id),
          ...(record.appointment.patient && {
            patient: record.appointment.patient.names,
          }),
          // ...(record.appointment.patient && {
          //   patient: {
          //     id: String(record.appointment.patient._id),
          //     number: record.appointment.patient.number,
          //     names: record.appointment.patient.names,
          //     birthdate: record.appointment.patient.birthdate,
          //     gender: record.appointment.patient.gender,
          //     phone: record.appointment.patient.phone,
          //     relationship: record.appointment.patient.relationship,
          //     healthcare: record.appointment.patient.healthcare,
          //     lastVisit: record.appointment.patient.lastVisit,
          //   },
          // }),
          ...(record.appointment.professional && {
            professional: record.appointment.professional.names,
          }),
          // ...(record.appointment.professional && {
          //   professional: {
          //     id: String(record.appointment.professional._id),
          //     names: record.appointment.professional.names,
          //     email: record.appointment.professional.email,
          //     password: record.appointment.professional.password,
          //     ...(record.appointment.professional.role && {
          //       role: {
          //         id: String(record.appointment.professional.role._id),
          //       },
          //     }),
          //   },
          // }),
          description: record.appointment.description,
          // ...(record.appointment.service && {
          //   service: {
          //     id: String(record.appointment.service._id),
          //     name: record.appointment.service.name,
          //     description: record.appointment.service.description,
          //     price: record.appointment.service.price,
          //     duration: record.appointment.service.duration,
          //     icon: record.appointment.service.icon,
          //     color: record.appointment.service.color,
          //   },
          // }),
          ...(record.appointment.service && {
            service: record.appointment.service.name,
          }),
          start: record.appointment.start,
          end: record.appointment.end,
          price: record.appointment.price,
          status: record.appointment.status,
          // },
        }),
        // ...(record.patient && {
        //   patient: {
        //     id: String(record.patient._id),
        //     number: record.patient.number,
        //     names: record.patient.names,
        //     birthdate: record.patient.birthdate,
        //     gender: record.patient.gender,
        //     phone: record.patient.phone,
        //     relationship: record.patient.relationship,
        //     healthcare: record.patient.healthcare,
        //     lastVisit: record.patient.lastVisit,
        //   },
        // }),
        ...(record.patient && {
          patient: record.patient.names,
        }),
        ...(record.professional && {
          professional: record.professional.names,
        }),
        description: record.description,
        // diagnosis: record.diagnosis,
        // treatment: record.treatment,
        // observations: record.observations,
        // ...(Array.isArray(record.archives) && {
        //   archives: record.archives.map((item) => ({
        //     id: String(item._id),
        //   })),
        // }),
        status: record.status,
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
  "/histories",
  body(upsertHistoryBodySchema),
  // (req, res, next) =>
  // authorization("history", req.body.id ? "canUpdate" : "canCreate")(
  // req,
  // res,
  // next,
  // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await HistorySchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El history solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && ["completed"].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El history no puede ser modificado por su estado actual.",
        });
      }

      await HistorySchema.findOneAndUpdate(
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
        message: "El history fue actualizado exitosamente.",
      });
    }

    const record = await HistorySchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "history",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El history fue creado exitosamente.",
    });
  },
);

router.get(
  "/histories/:id",
  params(getHistoryParamsSchema),
  // authorization("history", "canRead"),
  async (req, res) => {
    const record = await HistorySchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({
        path: "appointment",
        populate: [
          { path: "patient" },
          { path: "professional", populate: { path: "role" } },
          { path: "service" },
        ],
      })
      .populate({ path: "patient" })
      .populate({ path: "professional" })
      .populate({ path: "archives" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El history solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      ...(record.appointment && {
        appointment: {
          id: String(record.appointment._id),
          ...(record.appointment.patient && {
            patient: {
              id: String(record.appointment.patient._id),
              number: record.appointment.patient.number,
              names: record.appointment.patient.names,
              birthdate: record.appointment.patient.birthdate,
              gender: record.appointment.patient.gender,
              phone: record.appointment.patient.phone,
              relationship: record.appointment.patient.relationship,
              healthcare: record.appointment.patient.healthcare,
              lastVisit: record.appointment.patient.lastVisit,
            },
          }),
          ...(record.appointment.professional && {
            professional: {
              id: String(record.appointment.professional._id),
              names: record.appointment.professional.names,
              email: record.appointment.professional.email,
              password: record.appointment.professional.password,
              ...(record.appointment.professional.role && {
                role: {
                  id: String(record.appointment.professional.role._id),
                },
              }),
            },
          }),
          description: record.appointment.description,
          ...(record.appointment.service && {
            service: {
              id: String(record.appointment.service._id),
              name: record.appointment.service.name,
              description: record.appointment.service.description,
              price: record.appointment.service.price,
              duration: record.appointment.service.duration,
              icon: record.appointment.service.icon,
              color: record.appointment.service.color,
            },
          }),
          start: record.appointment.start,
          end: record.appointment.end,
          price: record.appointment.price,
          status: record.appointment.status,
        },
      }),
      ...(record.patient && {
        patient: {
          id: String(record.patient._id),
          number: record.patient.number,
          names: record.patient.names,
          birthdate: record.patient.birthdate,
          gender: record.patient.gender,
          phone: record.patient.phone,
          relationship: record.patient.relationship,
          healthcare: record.patient.healthcare,
          lastVisit: record.patient.lastVisit,
        },
      }),
      ...(record.professional && {
        professional: record.professional,
      }),
      description: record.description,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      observations: record.observations,
      ...(Array.isArray(record.archives) && {
        archives: record.archives.map((item) => ({
          id: String(item._id),
        })),
      }),
      status: record.status,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.delete(
  "/histories/:id",
  params(deleteHistoryParamsSchema),
  // authorization("history", "canDelete"),
  async (req, res) => {
    const record = await HistorySchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El history solicitado no fue encontrado.",
      });
    }

    if (record?.status && ["completed"].includes(record.status)) {
      return res.status(409).json({
        message: "El history no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "history",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await HistorySchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "history",
    // action: "remove",
    // value: 1,
    // });

    return res.status(200).json({
      message: "El history fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
