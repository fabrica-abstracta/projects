import { z } from "zod";
import { validatorMessages } from "../core/validator";

export const objectIdSchema = z
  .string({ message: validatorMessages.required })
  .regex(/^[0-9a-fA-F]{24}$/, validatorMessages.objectId);

export const booleanQuerySchema = z
  .enum(["true", "false"], { message: validatorMessages.invalidValue })
  .transform((value) => value === "true");

export const dateRangeQuerySchema = z.object({
  from: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),
  to: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),
});

export const idParamsSchema = z.object({
  id: objectIdSchema,
});

export const searchActivitiesQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  type: z.string({ message: validatorMessages.invalidType }).optional(),
  user: objectIdSchema.optional(),
  customer: objectIdSchema.optional(),
  summary: z.string({ message: validatorMessages.invalidType }).optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
});

export const upsertActivityBodySchema = z.object({
  id: objectIdSchema.optional(),
  type: z.string({ message: validatorMessages.invalidType }).optional(),
  user: objectIdSchema,
  customer: objectIdSchema.optional(),
  summary: z.string({ message: validatorMessages.invalidType }).optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
});

export const getActivityParamsSchema = idParamsSchema;

export const deleteActivityParamsSchema = idParamsSchema;

export const searchArchivesQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  bucket: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  object: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  name: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  mime: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  size: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).optional(),
});

export const upsertArchiveBodySchema = z.object({
  id: objectIdSchema.optional(),
  bucket: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  object: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  name: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  mime: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  size: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
});

export const getArchiveParamsSchema = idParamsSchema;

export const deleteArchiveParamsSchema = idParamsSchema;

export const searchRecoveriesQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  user: objectIdSchema.optional(),
  code: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  expires: dateRangeQuerySchema.optional(),
});

export const upsertRecoveryBodySchema = z.object({
  id: objectIdSchema.optional(),
  user: objectIdSchema,
  code: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  expires: z.string({ message: validatorMessages.required }).datetime({ message: validatorMessages.invalidDate }),
});

export const getRecoveryParamsSchema = idParamsSchema;

export const deleteRecoveryParamsSchema = idParamsSchema;

export const searchSessionsQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  user: objectIdSchema.optional(),
  device: z.string({ message: validatorMessages.invalidType }).optional(),
  ip: z.string({ message: validatorMessages.invalidType }).optional(),
  expires: dateRangeQuerySchema.optional(),
});

export const upsertSessionBodySchema = z.object({
  id: objectIdSchema.optional(),
  user: objectIdSchema,
  device: z.string({ message: validatorMessages.invalidType }).optional(),
  ip: z.string({ message: validatorMessages.invalidType }).optional(),
  expires: z.string({ message: validatorMessages.required }).datetime({ message: validatorMessages.invalidDate }),
});

export const getSessionParamsSchema = idParamsSchema;

export const deleteSessionParamsSchema = idParamsSchema;

export const searchCustomersQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  user: objectIdSchema.optional(),
  slug: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  document: z.string({ message: validatorMessages.invalidType }).optional(),
  number: z.string({ message: validatorMessages.invalidType }).optional(),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  phone: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
});

export const upsertCustomerBodySchema = z.object({
  id: objectIdSchema.optional(),
  user: objectIdSchema,
  slug: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  document: z.string({ message: validatorMessages.invalidType }).optional(),
  number: z.string({ message: validatorMessages.invalidType }).optional(),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  phone: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
  schedule: z.object({
    monday: z.object({
    isOpen: z.boolean({ message: validatorMessages.invalidType }).default(true),
    start: z.string({ message: validatorMessages.invalidType }).default("09:00"),
    end: z.string({ message: validatorMessages.invalidType }).default("18:00"),
  }).optional(),
    tuesday: z.object({
    isOpen: z.boolean({ message: validatorMessages.invalidType }).default(true),
    start: z.string({ message: validatorMessages.invalidType }).default("09:00"),
    end: z.string({ message: validatorMessages.invalidType }).default("18:00"),
  }).optional(),
    wednesday: z.object({
    isOpen: z.boolean({ message: validatorMessages.invalidType }).default(true),
    start: z.string({ message: validatorMessages.invalidType }).default("09:00"),
    end: z.string({ message: validatorMessages.invalidType }).default("18:00"),
  }).optional(),
    thursday: z.object({
    isOpen: z.boolean({ message: validatorMessages.invalidType }).default(true),
    start: z.string({ message: validatorMessages.invalidType }).default("09:00"),
    end: z.string({ message: validatorMessages.invalidType }).default("18:00"),
  }).optional(),
    friday: z.object({
    isOpen: z.boolean({ message: validatorMessages.invalidType }).default(true),
    start: z.string({ message: validatorMessages.invalidType }).default("09:00"),
    end: z.string({ message: validatorMessages.invalidType }).default("18:00"),
  }).optional(),
    saturday: z.object({
    isOpen: z.boolean({ message: validatorMessages.invalidType }).default(true),
    start: z.string({ message: validatorMessages.invalidType }).default("09:00"),
    end: z.string({ message: validatorMessages.invalidType }).default("18:00"),
  }).optional(),
    sunday: z.object({
    isOpen: z.boolean({ message: validatorMessages.invalidType }).default(true),
    start: z.string({ message: validatorMessages.invalidType }).default("09:00"),
    end: z.string({ message: validatorMessages.invalidType }).default("18:00"),
  }).optional(),
  }).optional(),
  closedDates: z.record(z.string({ message: validatorMessages.invalidType }), z.string({ message: validatorMessages.invalidType })).default({}),
});

export const getCustomerParamsSchema = idParamsSchema;

export const deleteCustomerParamsSchema = idParamsSchema;

export const searchProductsQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  product: objectIdSchema.optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  expires: dateRangeQuerySchema.optional(),
});

export const upsertProductBodySchema = z.object({
  id: objectIdSchema.optional(),
  product: objectIdSchema.optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  expires: z.string({ message: validatorMessages.required }).datetime({ message: validatorMessages.invalidDate }),
});

export const getProductParamsSchema = idParamsSchema;

export const deleteProductParamsSchema = idParamsSchema;

export const searchPaymentsQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  subscription: objectIdSchema.optional(),
  user: objectIdSchema.optional(),
  amount: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).optional(),
  method: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  status: z.enum(["pending","completed","failed","refunded"], { message: validatorMessages.invalidValue }).optional(),
  transaction: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  evidence: objectIdSchema.optional(),
});

export const upsertPaymentBodySchema = z.object({
  id: objectIdSchema.optional(),
  subscription: objectIdSchema,
  user: objectIdSchema,
  amount: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
  method: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  status: z.enum(["pending","completed","failed","refunded"], { message: validatorMessages.invalidValue }).default("pending"),
  transaction: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  evidence: objectIdSchema,
});

export const getPaymentParamsSchema = idParamsSchema;

export const deletePaymentParamsSchema = idParamsSchema;

export const searchProductsQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  sku: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  name: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  category: objectIdSchema.optional(),
  brand: objectIdSchema.optional(),
  stock: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).optional(),
  alert: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).optional(),
  price: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).optional(),
  isActive: booleanQuerySchema.optional(),
});

export const upsertProductBodySchema = z.object({
  id: objectIdSchema.optional(),
  sku: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  name: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  category: objectIdSchema.optional(),
  brand: objectIdSchema.optional(),
  stock: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).default(0),
  alert: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).default(0),
  price: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
  isActive: z.boolean({ message: validatorMessages.invalidType }).default(true),
});

export const getProductParamsSchema = idParamsSchema;

export const deleteProductParamsSchema = idParamsSchema;

export const searchRolesQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  name: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
});

export const upsertRoleBodySchema = z.object({
  id: objectIdSchema.optional(),
  name: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  permissions: z.record(z.string({ message: validatorMessages.invalidType }), z.array(z.string({ message: validatorMessages.invalidType }))).default({}),
});

export const getRoleParamsSchema = idParamsSchema;

export const deleteRoleParamsSchema = idParamsSchema;

export const searchSalesQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  type: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  customer: objectIdSchema.optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  total: z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative).optional(),
  method: z.string({ message: validatorMessages.invalidType }).optional(),
  reference: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  evidence: objectIdSchema.optional(),
  date: dateRangeQuerySchema.optional(),
});

export const upsertSaleBodySchema = z.object({
  id: objectIdSchema.optional(),
  type: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  customer: objectIdSchema.optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  products: z.array(z.object({
    sku: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
    name: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
    description: z.string({ message: validatorMessages.invalidType }).optional(),
    category: z.string({ message: validatorMessages.invalidType }).optional(),
    brand: z.string({ message: validatorMessages.invalidType }).optional(),
    price: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
    quantity: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
    subtotal: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
  }), { message: validatorMessages.required }),
  total: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
  method: z.string({ message: validatorMessages.invalidType }).optional(),
  reference: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
  evidence: objectIdSchema,
  date: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).default(() => new Date().toISOString()),
});

export const getSaleParamsSchema = idParamsSchema;

export const deleteSaleParamsSchema = idParamsSchema;

export const searchSubscriptionsQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  user: objectIdSchema.optional(),
  end: dateRangeQuerySchema.optional(),
});

export const upsertSubscriptionBodySchema = z.object({
  id: objectIdSchema.optional(),
  user: objectIdSchema.optional(),
  plan: z.object({
    name: z.string({ message: validatorMessages.required }).min(1, validatorMessages.required),
    description: z.string({ message: validatorMessages.invalidType }).optional(),
    price: z.coerce.number({ message: validatorMessages.required }).min(0, validatorMessages.notNegative),
    features: z.array(z.string({ message: validatorMessages.invalidType }), { message: validatorMessages.invalidType }).optional(),
    limits: z.record(z.string({ message: validatorMessages.invalidType }), z.coerce.number({ message: validatorMessages.invalidType }).min(0, validatorMessages.notNegative)),
  }),
  end: z.string({ message: validatorMessages.required }).datetime({ message: validatorMessages.invalidDate }),
});

export const getSubscriptionParamsSchema = idParamsSchema;

export const deleteSubscriptionParamsSchema = idParamsSchema;

export const searchTicketsQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  type: z.enum(["request","incident","query"], { message: validatorMessages.invalidValue }).optional(),
  archive: objectIdSchema.optional(),
  response: z.string({ message: validatorMessages.invalidType }).optional(),
  support: dateRangeQuerySchema.optional(),
  status: z.enum(["open","closed"], { message: validatorMessages.invalidValue }).optional(),
});

export const upsertTicketBodySchema = z.object({
  id: objectIdSchema.optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  type: z.enum(["request","incident","query"], { message: validatorMessages.invalidValue }).default("query"),
  archive: objectIdSchema.optional(),
  response: z.string({ message: validatorMessages.invalidType }).optional(),
  support: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),
  status: z.enum(["open","closed"], { message: validatorMessages.invalidValue }).default("open"),
});

export const getTicketParamsSchema = idParamsSchema;

export const deleteTicketParamsSchema = idParamsSchema;

export const searchUsersQuerySchema = z.object({
  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),
  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
  password: z.string({ message: validatorMessages.invalidType }).optional(),
  role: objectIdSchema.optional(),
});

export const upsertUserBodySchema = z.object({
  id: objectIdSchema.optional(),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
  password: z.string({ message: validatorMessages.invalidType }).optional(),
  role: objectIdSchema.optional(),
});

export const getUserParamsSchema = idParamsSchema;

export const deleteUserParamsSchema = idParamsSchema;
