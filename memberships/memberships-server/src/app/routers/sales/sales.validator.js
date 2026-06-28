const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

const searchSalesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  customer: objectIdSchema.optional(),
  date: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
});

const upsertSaleBodySchema = z.object({
  membership: objectIdSchema,
  total: z.coerce.number().min(0),
  date: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
});

const getSaleParamsSchema = z.object({
  id: objectIdSchema,
});

const deleteSaleParamsSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  searchSalesQuerySchema,
  upsertSaleBodySchema,
  getSaleParamsSchema,
  deleteSaleParamsSchema,
};
