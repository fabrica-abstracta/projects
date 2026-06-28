const router = require("express").Router();

const { PatientSchema } = require("../../schemas");

const {
  searchPatientsQuerySchema,
  upsertPatientBodySchema,
  getPatientParamsSchema,
  deletePatientParamsSchema,
} = require("../../validators");

const { body, query, params } = require("../../config/validator");

router.get(
  "/patients",
  query(searchPatientsQuerySchema),
  // authorization("patient", "canSearch"),
  async (req, res) => {
    const filter = {
      // company: req.identity.company.id,
      // ...(req.query.number !== undefined && {
      //   number: req.query.number,
      // }),
      ...(req.query.names !== undefined && {
        names: req.query.names,
      }),
      // ...(req.query.birthdate && {
      //   birthdate: {
      //     ...(req.query.birthdate.from && {
      //       $gte: req.query.birthdate.from,
      //     }),
      //     ...(req.query.birthdate.to && {
      //       $lte: req.query.birthdate.to,
      //     }),
      //   },
      // }),
      // ...(req.query.gender !== undefined && {
      //   gender: req.query.gender,
      // }),
      // ...(req.query.phone !== undefined && {
      //   phone: req.query.phone,
      // }),
      // ...(req.query.relationship !== undefined && {
      //   relationship: req.query.relationship,
      // }),
      // ...(req.query.healthcare !== undefined && {
      //   healthcare: req.query.healthcare,
      // }),
      // ...(req.query.lastVisit && {
      //   lastVisit: {
      //     ...(req.query.lastVisit.from && {
      //       $gte: req.query.lastVisit.from,
      //     }),
      //     ...(req.query.lastVisit.to && {
      //       $lte: req.query.lastVisit.to,
      //     }),
      //   },
      // }),
    };

    const skip = (req.query.page - 1) * req.query.perPage;
    const limit = req.query.perPage;

    const [items, totalItems] = await Promise.all([
      PatientSchema.find(filter)
        .populate({ path: "healthcare" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      PatientSchema.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const page = Math.floor(skip / limit) + 1;

    return res.status(200).json({
      data: items.map((record) => ({
        id: String(record._id),
        number: record.number,
        names: record.names,
        birthdate: record.birthdate,
        // gender: record.gender,
        phone: record.phone,
        // relationship: record.relationship,
        // ...(record.healthcare && {
        //   healthcare: {
        //     id: String(record.healthcare._id),
        //     number: record.healthcare.number,
        //     names: record.healthcare.names,
        //     birthdate: record.healthcare.birthdate,
        //     gender: record.healthcare.gender,
        //     phone: record.healthcare.phone,
        //     relationship: record.healthcare.relationship,
        //     healthcare: record.healthcare.healthcare,
        //     lastVisit: record.healthcare.lastVisit,
        //   },
        // }),
        lastVisit: record.lastVisit,
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
  "/patients",
  body(upsertPatientBodySchema),
  // (req, res, next) =>
  // authorization("patient", req.body.id ? "canUpdate" : "canCreate")(
  // req,
  // res,
  // next,
  // ),
  async (req, res) => {
    if (req.body.id) {
      const oldRecord = await PatientSchema.findOne({
        _id: req.body.id,
        // company: req.identity.company.id,
      });

      if (!oldRecord) {
        return res.status(404).json({
          message: "El paciente solicitado no fue encontrado.",
        });
      }

      if (oldRecord?.status && [].includes(oldRecord.status)) {
        return res.status(409).json({
          message: "El paciente no puede ser modificado por su estado actual.",
        });
      }

      await PatientSchema.findOneAndUpdate(
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
        message: "El paciente fue actualizado exitosamente.",
      });
    }

    const record = await PatientSchema.create({
      ...req.body,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "patient",
    // });

    return res.status(200).json({
      id: String(record._id),
      message: "El paciente fue creado exitosamente.",
    });
  },
);

router.get(
  "/patients/:id",
  params(getPatientParamsSchema),
  // authorization("patient", "canRead"),
  async (req, res) => {
    const record = await PatientSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    })
      .populate({ path: "healthcare" })
      .lean();

    if (!record) {
      return res.status(404).json({
        message: "El paciente solicitado no fue encontrado.",
      });
    }

    return res.status(200).json({
      id: String(record._id),
      number: record.number,
      names: record.names,
      birthdate: record.birthdate,
      gender: record.gender,
      phone: record.phone,
      relationship: record.relationship,
      ...(record.healthcare && {
        healthcare: {
          id: String(record.healthcare._id),
          number: record.healthcare.number,
          names: record.healthcare.names,
          birthdate: record.healthcare.birthdate,
          gender: record.healthcare.gender,
          phone: record.healthcare.phone,
          relationship: record.healthcare.relationship,
          healthcare: record.healthcare.healthcare,
          lastVisit: record.healthcare.lastVisit,
        },
      }),
      lastVisit: record.lastVisit,
      // created: record.createdAt,
      // updated: record.updatedAt,
    });
  },
);

router.delete(
  "/patients/:id",
  params(deletePatientParamsSchema),
  // authorization("patient", "canDelete"),
  async (req, res) => {
    const record = await PatientSchema.findOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    if (!record) {
      return res.status(404).json({
        message: "El paciente solicitado no fue encontrado.",
      });
    }

    if (record?.status && [].includes(record.status)) {
      return res.status(409).json({
        message: "El paciente no puede ser modificado por su estado actual.",
      });
    }

    await canDelete({
      Model: null,
      key: "patient",
      value: req.params.id,
      // company: req.identity.company.id,
    });

    await PatientSchema.deleteOne({
      _id: req.params.id,
      // company: req.identity.company.id,
    });

    // await usage({
    // company: req.identity.company.id,
    // subscription: req.identity.subscription.id,
    // key: "patient",
    // action: "remove",
    // value: 1,
    // });

    return res.status(200).json({
      message: "El paciente fue eliminado exitosamente.",
    });
  },
);

module.exports = router;
