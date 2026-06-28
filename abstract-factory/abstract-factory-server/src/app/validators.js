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
  from: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),
  to: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),
});

const idParamsSchema = z.object({
  id: objectIdSchema,
});

module.exports = {
  validatorMessages,
  objectIdSchema,
  booleanQuerySchema,
  dateRangeQuerySchema,
  idParamsSchema,
};
