const DEFAULT_MESSAGES = {
  invalid_type: "Tipo de dato inválido",
  too_small: "El valor es demasiado pequeño",
  too_big: "El valor es demasiado grande",
  invalid_string: "Formato de texto inválido",
  invalid_format: "Formato inválido",
  invalid_enum_value: "Valor no permitido",
  invalid_value: "Valor no permitido",
  invalid_literal: "Valor no permitido",
  unrecognized_keys: "Campos no permitidos",
  invalid_union: "No coincide con ningún formato permitido",
  invalid_union_discriminator: "No coincide con ningún formato permitido",
  invalid_date: "Fecha inválida",
  not_finite: "El número no es válido",
  not_multiple_of: "El número no cumple con el múltiplo requerido",
  invalid_arguments: "Argumentos inválidos",
  invalid_return_type: "Tipo de retorno inválido",
  invalid_intersection_types: "No se pudieron combinar los tipos",
  invalid_key: "Clave inválida",
  invalid_element: "Elemento inválido",
  custom: "No cumple con la validación requerida",
};

const DEFAULT_ZOD_MESSAGES = [
  "Required",
  "Invalid input",
  "Invalid option",
  "Invalid enum value",
  "Expected string",
  "Expected number",
  "Expected boolean",
  "Expected object",
  "Expected array",
  "Expected date",
  "Expected bigint",
  "Expected symbol",
  "Expected function",
  "Expected undefined",
  "Expected null",
  "Expected void",
  "Expected never",
  "Expected integer",
  "Unrecognized key",
  "Unrecognized keys",
  "String must contain",
  "Number must be",
  "Array must contain",
  "Date must be",
  "Too small",
  "Too big",
];

const setRequestValue = (req, key, value) => {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};

const isRequiredIssue = (issue) => {
  return (
    issue.code === "invalid_type" &&
    (issue.received === "undefined" ||
      issue.input === undefined ||
      String(issue.message || "").includes("received undefined"))
  );
};

const isDefaultZodMessage = (message) => {
  return DEFAULT_ZOD_MESSAGES.some((item) =>
    String(message || "").startsWith(item),
  );
};

const getField = (issue) => {
  if (issue.path && issue.path.length) {
    return issue.path.join(".");
  }

  if (issue.keys && issue.keys.length) {
    return issue.keys.join(".");
  }

  return "unknown";
};

const getTooSmallMessage = (issue) => {
  if ((issue.minimum === 1 || issue.minimum === 0) && issue.input === "") {
    return "Campo obligatorio";
  }

  if (
    issue.minimum === 0 &&
    (issue.type === "number" || issue.origin === "number")
  ) {
    return "El valor no puede ser negativo";
  }

  if (issue.minimum !== undefined) {
    return `El valor debe ser mayor o igual a ${issue.minimum}`;
  }

  return DEFAULT_MESSAGES.too_small;
};

const getTooBigMessage = (issue) => {
  if (issue.maximum !== undefined) {
    return `El valor debe ser menor o igual a ${issue.maximum}`;
  }

  return DEFAULT_MESSAGES.too_big;
};

const getIssueMessage = (issue) => {
  if (isRequiredIssue(issue)) {
    return "Campo obligatorio";
  }

  if (issue.code === "too_small") {
    return getTooSmallMessage(issue);
  }

  if (issue.code === "too_big") {
    return getTooBigMessage(issue);
  }

  if (issue.code === "unrecognized_keys") {
    return "Campos no permitidos";
  }

  if (issue.code === "invalid_value" || issue.code === "invalid_enum_value") {
    return "Valor no permitido";
  }

  if (issue.message && !isDefaultZodMessage(issue.message)) {
    return issue.message;
  }

  return (
    DEFAULT_MESSAGES[issue.code] || "No cumple con la validación requerida"
  );
};

const formatZodErrors = (error) => {
  return error.issues.map((issue) => ({
    field: getField(issue),
    message: getIssueMessage(issue),
  }));
};

const validate = (schema, source) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        message: "Error de validación",
        errors: formatZodErrors(result.error),
      });
    }

    if (source === "query") {
      setRequestValue(req, "query", result.data);
    } else {
      req[source] = result.data;
    }

    next();
  };
};

module.exports = {
  body: (schema) => validate(schema, "body"),
  query: (schema) => validate(schema, "query"),
  params: (schema) => validate(schema, "params"),
};
