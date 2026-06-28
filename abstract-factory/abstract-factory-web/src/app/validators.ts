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
