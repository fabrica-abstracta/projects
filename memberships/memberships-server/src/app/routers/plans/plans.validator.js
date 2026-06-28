const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

const searchPlansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  name: z.string().min(1).optional(),
});

const upsertPlanBodySchema = z.object({
  id: objectIdSchema.optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  duration: z.coerce.number().min(0).default(1),
  price: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
});

const getPlanParamsSchema = z.object({
  id: objectIdSchema,
});

const deletePlanParamsSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  searchPlansQuerySchema,
  upsertPlanBodySchema,
  getPlanParamsSchema,
  deletePlanParamsSchema,
};
