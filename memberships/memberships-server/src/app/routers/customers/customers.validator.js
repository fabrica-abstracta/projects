const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

const searchCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  document: z.string().optional(),
  names: z.string().optional(),
  birthdate: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
  gender: z.string().optional(),
  contact: z.string().optional(),
});

const upsertCustomerBodySchema = z.object({
  id: objectIdSchema.optional(),
  document: z.string().optional(),
  number: z.string().optional(),
  paternal: z.string().optional(),
  maternal: z.string().optional(),
  names: z.string().optional(),
  birthdate: z.string().datetime().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

const getCustomerParamsSchema = z.object({
  id: objectIdSchema,
});

const deleteCustomerParamsSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  searchCustomersQuerySchema,
  upsertCustomerBodySchema,
  getCustomerParamsSchema,
  deleteCustomerParamsSchema,
};
