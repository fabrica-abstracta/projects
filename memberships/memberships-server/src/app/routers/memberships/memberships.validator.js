const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const searchMembershipsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  plan: objectIdSchema.optional(),
  customer: objectIdSchema.optional(),
  start: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
  isActive: booleanQuerySchema.optional(),
});

const upsertMembershipBodySchema = z.object({
  id: objectIdSchema.optional(),
  plan: objectIdSchema,
  customer: objectIdSchema,
  price: z.coerce.number().min(0),
  currency: z.string().default("PEN"),
  start: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  end: z.string().datetime(),
  isActive: z.boolean().default(true),
});

const getMembershipParamsSchema = z.object({
  id: objectIdSchema,
});

const deleteMembershipParamsSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  searchMembershipsQuerySchema,
  upsertMembershipBodySchema,
  getMembershipParamsSchema,
  deleteMembershipParamsSchema,
};
