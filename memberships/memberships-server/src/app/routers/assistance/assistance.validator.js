const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "El identificador no es válido.");

const searchAttendancesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(["membership", "visit"]).optional(),
  membership: objectIdSchema.optional(),
  date: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
});

const upsertAttendanceBodySchema = z.preprocess(
  (value) => ({
    type: "membership",
    ...value,
  }),
  z.discriminatedUnion("type", [
    z.object({
      id: objectIdSchema.optional(),
      type: z.literal("membership"),
      membership: objectIdSchema,
      date: z
        .string()
        .datetime()
        .default(() => new Date().toISOString()),
    }),

    z.object({
      id: objectIdSchema.optional(),
      type: z.literal("visit"),
      price: z.coerce.number().min(0, "El precio no puede ser negativo."),
      date: z
        .string()
        .datetime()
        .default(() => new Date().toISOString()),
    }),
  ]),
);

const getAttendanceParamsSchema = z.object({
  id: objectIdSchema,
});

const deleteAttendanceParamsSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  searchAttendancesQuerySchema,
  upsertAttendanceBodySchema,
  getAttendanceParamsSchema,
  deleteAttendanceParamsSchema,
};
