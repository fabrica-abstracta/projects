const { z } = require("zod");

const validatorMessages = {
  required: "Campo obligatorio",
  objectId: "El identificador no es válido.",
  invalidType: "Tipo de dato inválido",
  tooSmall: "El valor es demasiado pequeño",
  tooBig: "El valor es demasiado grande",
  invalidString: "Formato de texto inválido",
  invalidFormat: "Formato inválido",
  invalidEnumValue: "Valor no permitido",
  invalidValue: "Valor no permitido",
  invalidLiteral: "Valor no permitido",
  unrecognizedKeys: "Campos no permitidos",
  invalidUnion: "No coincide con ningún formato permitido",
  invalidDate: "Fecha inválida",
  notFinite: "El número no es válido",
  notMultipleOf: "El número no cumple con el múltiplo requerido",
  integer: "El número debe ser entero",
  notNegative: "El valor no puede ser negativo",
  custom: "No cumple con la validación requerida",
  validationError: "Error de validación",
  unexpected: "Ocurrió un error inesperado.",
  min: (value) => `El valor debe ser mayor o igual a ${value}`,
  max: (value) => `El valor debe ser menor o igual a ${value}`,
  minLength: (value) => `Debe tener al menos ${value} caracteres`,
  maxLength: (value) => `Debe tener como máximo ${value} caracteres`,
};

const objectIdSchema = z
  .string({ message: validatorMessages.required })
  .regex(/^[0-9a-fA-F]{24}$/, validatorMessages.objectId);

const booleanQuerySchema = z
  .enum(["true", "false"], { message: validatorMessages.invalidValue })
  .transform((value) => value === "true");

const dateRangeQuerySchema = z.object({
  from: z
    .string({ message: validatorMessages.invalidType })
    .datetime({ message: validatorMessages.invalidDate })
    .optional(),
  to: z
    .string({ message: validatorMessages.invalidType })
    .datetime({ message: validatorMessages.invalidDate })
    .optional(),
});

const idParamsSchema = z.object({
  id: objectIdSchema,
});

const searchRolesQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
});

const upsertRoleBodySchema = z.object({
  id: objectIdSchema.optional(),
});

const getRoleParamsSchema = idParamsSchema;

const deleteRoleParamsSchema = idParamsSchema;

const searchUsersQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
  password: z.string({ message: validatorMessages.invalidType }).optional(),
  role: objectIdSchema.optional(),
});

const upsertUserBodySchema = z.object({
  id: objectIdSchema.optional(),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
  password: z.string({ message: validatorMessages.invalidType }).optional(),
  role: objectIdSchema.optional(),
});

const getUserParamsSchema = idParamsSchema;

const deleteUserParamsSchema = idParamsSchema;

const searchPaymentsQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
});

const upsertPaymentBodySchema = z.object({
  id: objectIdSchema.optional(),
});

const getPaymentParamsSchema = idParamsSchema;

const deletePaymentParamsSchema = idParamsSchema;

const searchTicketsQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
});

const upsertTicketsBodySchema = z.object({
  id: objectIdSchema.optional(),
});

const getTicketsParamsSchema = idParamsSchema;

const deleteTicketsParamsSchema = idParamsSchema;

const searchActivitiesQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
  type: z.string({ message: validatorMessages.invalidType }).optional(),
  user: objectIdSchema.optional(),
  customer: objectIdSchema.optional(),
  summary: z
    .string({ message: validatorMessages.invalidType })
    .min(1, validatorMessages.required)
    .optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  total: z.coerce
    .number({ message: validatorMessages.invalidType })
    .min(0, validatorMessages.notNegative)
    .optional(),
});

const upsertActivityBodySchema = z.object({
  id: objectIdSchema.optional(),
  type: z.string({ message: validatorMessages.invalidType }).optional(),
  user: objectIdSchema,
  customer: objectIdSchema.optional(),
  summary: z
    .string({ message: validatorMessages.required })
    .min(1, validatorMessages.required),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  total: z.coerce
    .number({ message: validatorMessages.required })
    .min(0, validatorMessages.notNegative),
});

const getActivityParamsSchema = idParamsSchema;

const deleteActivityParamsSchema = idParamsSchema;

const searchAppointmentsQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
  patient: objectIdSchema.optional(),
  professional: objectIdSchema.optional(),
  service: objectIdSchema.optional(),
  start: dateRangeQuerySchema.optional(),
  status: z
    .enum(
      [
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      { message: validatorMessages.invalidValue },
    )
    .optional(),
});

const upsertAppointmentBodySchema = z.object({
  id: objectIdSchema.optional(),
  patient: objectIdSchema,
  professional: objectIdSchema,
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  service: objectIdSchema,
  start: z
    .string({ message: validatorMessages.required })
    .datetime({ message: validatorMessages.invalidDate })
    .default(() => new Date().toISOString()),
  status: z
    .enum(
      [
        "pending",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      { message: validatorMessages.invalidValue },
    )
    .default("pending"),
});

const getAppointmentParamsSchema = idParamsSchema;

const deleteAppointmentParamsSchema = idParamsSchema;

const searchCustomersQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
  user: objectIdSchema.optional(),
  slug: z
    .string({ message: validatorMessages.invalidType })
    .min(1, validatorMessages.required)
    .optional(),
  number: z.string({ message: validatorMessages.invalidType }).optional(),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  phone: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
});

const upsertCustomerBodySchema = z.object({
  id: objectIdSchema.optional(),
  user: objectIdSchema,
  slug: z
    .string({ message: validatorMessages.required })
    .min(1, validatorMessages.required),
  number: z.string({ message: validatorMessages.invalidType }).optional(),
  names: z.string({ message: validatorMessages.invalidType }).optional(),
  phone: z.string({ message: validatorMessages.invalidType }).optional(),
  email: z.string({ message: validatorMessages.invalidType }).optional(),
  schedule: z
    .object({
      monday: z
        .object({
          isOpen: z
            .boolean({ message: validatorMessages.invalidType })
            .default(true),
          start: z
            .string({ message: validatorMessages.invalidType })
            .default("09:00"),
          end: z
            .string({ message: validatorMessages.invalidType })
            .default("18:00"),
        })
        .optional(),
      tuesday: z
        .object({
          isOpen: z
            .boolean({ message: validatorMessages.invalidType })
            .default(true),
          start: z
            .string({ message: validatorMessages.invalidType })
            .default("09:00"),
          end: z
            .string({ message: validatorMessages.invalidType })
            .default("18:00"),
        })
        .optional(),
      wednesday: z
        .object({
          isOpen: z
            .boolean({ message: validatorMessages.invalidType })
            .default(true),
          start: z
            .string({ message: validatorMessages.invalidType })
            .default("09:00"),
          end: z
            .string({ message: validatorMessages.invalidType })
            .default("18:00"),
        })
        .optional(),
      thursday: z
        .object({
          isOpen: z
            .boolean({ message: validatorMessages.invalidType })
            .default(true),
          start: z
            .string({ message: validatorMessages.invalidType })
            .default("09:00"),
          end: z
            .string({ message: validatorMessages.invalidType })
            .default("18:00"),
        })
        .optional(),
      friday: z
        .object({
          isOpen: z
            .boolean({ message: validatorMessages.invalidType })
            .default(true),
          start: z
            .string({ message: validatorMessages.invalidType })
            .default("09:00"),
          end: z
            .string({ message: validatorMessages.invalidType })
            .default("18:00"),
        })
        .optional(),
      saturday: z
        .object({
          isOpen: z
            .boolean({ message: validatorMessages.invalidType })
            .default(true),
          start: z
            .string({ message: validatorMessages.invalidType })
            .default("09:00"),
          end: z
            .string({ message: validatorMessages.invalidType })
            .default("18:00"),
        })
        .optional(),
      sunday: z
        .object({
          isOpen: z
            .boolean({ message: validatorMessages.invalidType })
            .default(true),
          start: z
            .string({ message: validatorMessages.invalidType })
            .default("09:00"),
          end: z
            .string({ message: validatorMessages.invalidType })
            .default("18:00"),
        })
        .optional(),
    })
    .optional(),
  closedDates: z
    .record(
      z.string({ message: validatorMessages.invalidType }),
      z.string({ message: validatorMessages.invalidType }),
    )
    .default({}),
});

const getCustomerParamsSchema = idParamsSchema;

const deleteCustomerParamsSchema = idParamsSchema;

const searchPatientsQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
  // number: z.string({ message: validatorMessages.invalidType }).min(1, validatorMessages.required).optional(),
  names: z
    .string({ message: validatorMessages.invalidType })
    .min(1, validatorMessages.required)
    .optional(),
  // birthdate: dateRangeQuerySchema.optional(),
  // gender: z.string({ message: validatorMessages.invalidType }).optional(),
  // phone: z.string({ message: validatorMessages.invalidType }).optional(),
  // relationship: z.string({ message: validatorMessages.invalidType }).optional(),
  // healthcare: objectIdSchema.optional(),
  // lastVisit: dateRangeQuerySchema.optional(),
});

const upsertPatientBodySchema = z.object({
  id: objectIdSchema.optional(),
  number: z
    .string({ message: validatorMessages.required })
    .min(1, validatorMessages.required),
  names: z
    .string({ message: validatorMessages.required })
    .min(1, validatorMessages.required),
  birthdate: z
    .string({ message: validatorMessages.invalidType })
    .datetime({ message: validatorMessages.invalidDate })
    .optional(),
  gender: z.string({ message: validatorMessages.invalidType }).optional(),
  phone: z.string({ message: validatorMessages.invalidType }).optional(),
  relationship: z.string({ message: validatorMessages.invalidType }).optional(),
  healthcare: objectIdSchema.optional(),
  lastVisit: z
    .string({ message: validatorMessages.invalidType })
    .datetime({ message: validatorMessages.invalidDate })
    .optional(),
});

const getPatientParamsSchema = idParamsSchema;

const deletePatientParamsSchema = idParamsSchema;

const searchServicesQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
  name: z
    .string({ message: validatorMessages.invalidType })
    .min(1, validatorMessages.required)
    .optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  price: z.coerce
    .number({ message: validatorMessages.invalidType })
    .min(0, validatorMessages.notNegative)
    .optional(),
  duration: z.coerce
    .number({ message: validatorMessages.invalidType })
    .min(1, validatorMessages.min(1))
    .optional(),
  icon: z.string({ message: validatorMessages.invalidType }).optional(),
  color: z.string({ message: validatorMessages.invalidType }).optional(),
});

const upsertServiceBodySchema = z.object({
  id: objectIdSchema.optional(),
  name: z
    .string({ message: validatorMessages.required })
    .min(1, validatorMessages.required),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  price: z.coerce
    .number({ message: validatorMessages.required })
    .min(0, validatorMessages.notNegative),
  duration: z.coerce
    .number({ message: validatorMessages.invalidType })
    .min(1, validatorMessages.min(1))
    .default(30),
  icon: z.string({ message: validatorMessages.invalidType }).optional(),
  color: z.string({ message: validatorMessages.invalidType }).optional(),
});

const getServiceParamsSchema = idParamsSchema;

const deleteServiceParamsSchema = idParamsSchema;

const searchHistoriesQuerySchema = z.object({
  page: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .default(1),
  perPage: z.coerce
    .number({ message: validatorMessages.invalidType })
    .int(validatorMessages.integer)
    .min(1, validatorMessages.min(1))
    .max(100, validatorMessages.max(100))
    .default(10),
  appointment: objectIdSchema.optional(),
  patient: objectIdSchema.optional(),
  professional: objectIdSchema.optional(),
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  diagnosis: z.string({ message: validatorMessages.invalidType }).optional(),
  treatment: z.string({ message: validatorMessages.invalidType }).optional(),
  observations: z.string({ message: validatorMessages.invalidType }).optional(),
  status: z
    .enum(["draft", "completed", "voided"], {
      message: validatorMessages.invalidValue,
    })
    .optional(),
});

const upsertHistoryBodySchema = z.object({
  id: objectIdSchema.optional(),
  appointment: objectIdSchema.optional(),
  patient: objectIdSchema,
  professional: objectIdSchema,
  description: z.string({ message: validatorMessages.invalidType }).optional(),
  diagnosis: z.string({ message: validatorMessages.invalidType }).optional(),
  treatment: z.string({ message: validatorMessages.invalidType }).optional(),
  observations: z.string({ message: validatorMessages.invalidType }).optional(),
  archives: z.array(
    z.object({
      archive: objectIdSchema,
      description: z
        .string({ message: validatorMessages.invalidType })
        .optional(),
    }),
    { message: validatorMessages.required },
  ),
  status: z
    .enum(["draft", "completed", "voided"], {
      message: validatorMessages.invalidValue,
    })
    .default("draft"),
});

const getHistoryParamsSchema = idParamsSchema;

const deleteHistoryParamsSchema = idParamsSchema;

module.exports = {
  validatorMessages,
  objectIdSchema,
  booleanQuerySchema,
  dateRangeQuerySchema,
  idParamsSchema,
  searchRolesQuerySchema,
  upsertRoleBodySchema,
  getRoleParamsSchema,
  deleteRoleParamsSchema,
  searchUsersQuerySchema,
  upsertUserBodySchema,
  getUserParamsSchema,
  deleteUserParamsSchema,
  searchPaymentsQuerySchema,
  upsertPaymentBodySchema,
  getPaymentParamsSchema,
  deletePaymentParamsSchema,
  searchTicketsQuerySchema,
  upsertTicketsBodySchema,
  getTicketsParamsSchema,
  deleteTicketsParamsSchema,
  searchActivitiesQuerySchema,
  upsertActivityBodySchema,
  getActivityParamsSchema,
  deleteActivityParamsSchema,
  searchAppointmentsQuerySchema,
  upsertAppointmentBodySchema,
  getAppointmentParamsSchema,
  deleteAppointmentParamsSchema,
  searchCustomersQuerySchema,
  upsertCustomerBodySchema,
  getCustomerParamsSchema,
  deleteCustomerParamsSchema,
  searchPatientsQuerySchema,
  upsertPatientBodySchema,
  getPatientParamsSchema,
  deletePatientParamsSchema,
  searchServicesQuerySchema,
  upsertServiceBodySchema,
  getServiceParamsSchema,
  deleteServiceParamsSchema,
  searchHistoriesQuerySchema,
  upsertHistoryBodySchema,
  getHistoryParamsSchema,
  deleteHistoryParamsSchema,
};
