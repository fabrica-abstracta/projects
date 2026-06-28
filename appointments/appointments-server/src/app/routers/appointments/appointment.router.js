const router = require("express").Router();

const { AppointmentSchema, HistorySchema } = require("../../schemas");

const {
  searchAppointmentsQuerySchema,
  upsertAppointmentBodySchema,
  getAppointmentParamsSchema,
  deleteAppointmentParamsSchema,
} = require("../../validators");

const { body, query, params } = require("../../config/validator");

router.get(
  "/appointments",
  query(searchAppointmentsQuerySchema),
  // authorization("appointment", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      ...(req.query.patient !== undefined && {
        patient: req.query.patient,
      }),
      ...(req.query.professional !== undefined && {
        professional: req.query.professional,
      }),
      // ...(req.query.description !== undefined && {
      //   description: req.query.description,
      // }),
      ...(req.query.service !== undefined && {
        service: req.query.service,
      }),
      // ...(req.query.start && {
      //   start: {
      //     ...(req.query.start.from && {
      //       $gte: req.query.start.from,
      //     }),
      //     ...(req.query.start.to && {
      //       $lte: req.query.start.to,
      //     }),
      //   },
      // }),
      // ...(req.query.end && {
      //   end: {
      //     ...(req.query.end.from && {
      //       $gte: req.query.end.from,
      //     }),
      //     ...(req.query.end.to && {
      //       $lte: req.query.end.to,
      //     }),
      //   },
      // }),
      // ...(req.query.price !== undefined && {
      //   price: req.query.price,
      // }),
      ...(req.query.status !== undefined && {
        status: req.query.status,
      }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      AppointmentSchema.find(filter)
        .populate({ path: "patient" })
        .populate({ path: "professional", populate: { path: "role" } })
        .populate({ path: "service" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AppointmentSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        ...(record.patient && {
          patient: record.patient?.names,
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
        ...(record.professional && {
          professional: record.professional?.names,
        }),
        // ...(record.professional && {
        //   professional: {
        //     id: String(record.professional._id),
        //     names: record.professional.names,
        //     email: record.professional.email,
        //     password: record.professional.password,
        //     ...(record.professional.role && {
        //       role: {
        //         id: String(record.professional.role._id),
        //       },
        //     }),
        //   },
        // }),
        description: record.description,
        ...(record.service && {
          service: record.service?.name,
        }),
        // ...(record.service && {
        //   service: {
        //     id: String(record.service._id),
        //     name: record.service.name,
        //     description: record.service.description,
        //     price: record.service.price,
        //     duration: record.service.duration,
        //     icon: record.service.icon,
        //     color: record.service.color,
        //   },
        // }),
        start: record.start,
        price: record.price,
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
  "/appointments",
  body(upsertAppointmentBodySchema),
  // (req, res, next) =>
  // authorization("appointment", req.body.id ? "canUpdate" : "canCreate")(
  // req,
  // res,
  // next,
  // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await AppointmentSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "La cita solicitado no fue encontrado.",
        });
      }

      if (
        oldRecord?.status &&
        ["in-progress", "completed", "cancelled"].includes(oldRecord.status)
      ) {
        return res.status(409).json({
          message: "La cita no puede ser modificado por su estado actual.",
        });
      }

      await AppointmentSchema.findOneAndUpdate(
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
        message: "La cita fue actualizado exitosamente.",
      });
    }

    const record = await AppointmentSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "appointment",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "La cita fue creado exitosamente.",
    });
  },
);

router.get(
  "/appointments/:id",
  params(getAppointmentParamsSchema),
  // authorization("appointment", "canRead"),
  async (req, res) => {
    const record = await AppointmentSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "patient" })
      .populate({ path: "professional", populate: { path: "role" } })
      .populate({ path: "service" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "La cita solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
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
        professional: {
          id: String(record.professional._id),
          names: record.professional.names,
          email: record.professional.email,
          password: record.professional.password,
          ...(record.professional.role && {
            role: {
              id: String(record.professional.role._id),
            },
          }),
        },
      }),
      description: record.description,
      ...(record.service && {
        service: {
          id: String(record.service._id),
          name: record.service.name,
          description: record.service.description,
          price: record.service.price,
          duration: record.service.duration,
          icon: record.service.icon,
          color: record.service.color,
        },
      }),
      start: record.start,
      end: record.end,
      price: record.price,
      status: record.status,
      created: record.createdAt,
      updated: record.updatedAt,
    });
  },
);

router.post(
  "/appointments/:id/start",
  params(getAppointmentParamsSchema),
  // authorization("appointment", "canStart"),
  async (req, res) => {
    const record = await AppointmentSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    }).lean();

    if (!record) {
      return res.status(404).json({
        message: "La cita solicitado no fue encontrado.",
      });
    }

    if (record.status !== "pending") {
      return res.status(409).json({
        message: "El appointment no puede ser modificado por su estado actual.",
      });
    }

    await HistorySchema.create({
      // company: appointment.company,
      appointment: req.params.id,
      patient: record.patient,
      professional: record.professional,
      description: record.description,
    });

    await AppointmentSchema.findByIdAndUpdate(req.params.id, {
      status: "in-progress",
    });

    return res
      .status(200)
      .json({ message: "El appointment fue iniciado exitosamente." });
    return res.status(200).json({
      id: String(record._id),
    });
  },
);

router.delete(
  "/appointments/:id",
  params(deleteAppointmentParamsSchema),
  // authorization("appointment", "canDelete"),
  async (req, res) => {
    const record = await AppointmentSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "La cita solicitado no fue encontrado.",
      });
    }

    if (
      record?.status &&
      ["in-progress", "completed", "cancelled"].includes(record.status)
    ) {
      return res.status(409).json({
        message: "La cita no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "appointment",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await AppointmentSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "appointment",
    // action: "remove",
    // value: 1,
    // });

    return res.status(200).json({
      message: "La cita fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
