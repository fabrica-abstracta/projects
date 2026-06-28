#!/usr/bin/env node
"use strict";

/*
────────────────────────────────────────────────────────────
REGION: imports
────────────────────────────────────────────────────────────
*/
const fs = require("fs");
const path = require("path");

/*
────────────────────────────────────────────────────────────
REGION: console
────────────────────────────────────────────────────────────
*/
const line = () => console.log("────────────────────────────────────────");
const info = (text) => console.log(`ℹ ${text}`);
const ok = (text) => console.log(`✅ ${text}`);
const warn = (text) => console.log(`⚠ ${text}`);
const error = (text) => console.log(`✗ ${text}`);

/*
────────────────────────────────────────────────────────────
REGION: text helpers
────────────────────────────────────────────────────────────
*/
function pascalCase(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function camelCase(value) {
  const pascal = pascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function kebabToRoute(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function normalizeSlash(value) {
  return value.replace(/\\/g, "/");
}

function jsString(value) {
  return JSON.stringify(String(value));
}

function makeRequirePath(fromDir, filePath) {
  let relative = normalizeSlash(path.relative(fromDir, filePath));
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return relative.replace(/\.js$/, "");
}

function pluralize(value) {
  const word = String(value || "");
  if (word.endsWith("y")) return `${word.slice(0, -1)}ies`;
  if (word.endsWith("s")) return word;
  return `${word}s`;
}

/*
────────────────────────────────────────────────────────────
REGION: spanish labels
────────────────────────────────────────────────────────────
*/
const fallbackLabels = {
  id: { label: "identificador", gender: "m" },
  code: { label: "código", gender: "m" },
  number: { label: "número", gender: "m" },
  reference: { label: "referencia", gender: "f" },
  sequence: { label: "secuencia", gender: "f" },

  alert: { label: "alerta", gender: "f" },
  evidence: { label: "evidencia", gender: "m" },
  method: { label: "método", gender: "m" },
  object: { label: "objeto", gender: "m" },
  name: { label: "nombre", gender: "m" },
  firstName: { label: "nombre", gender: "m" },
  lastName: { label: "apellido", gender: "m" },
  fullName: { label: "nombre completo", gender: "m" },
  username: { label: "usuario", gender: "m" },
  email: { label: "correo electrónico", gender: "m" },
  password: { label: "contraseña", gender: "f" },
  phone: { label: "teléfono", gender: "m" },
  mobile: { label: "celular", gender: "m" },
  address: { label: "dirección", gender: "f" },
  city: { label: "ciudad", gender: "f" },
  district: { label: "distrito", gender: "m" },
  province: { label: "provincia", gender: "f" },
  country: { label: "país", gender: "m" },
  document: { label: "documento", gender: "m" },
  documentType: { label: "tipo de documento", gender: "m" },
  documentNumber: { label: "número de documento", gender: "m" },
  birthDate: { label: "fecha de nacimiento", gender: "f" },
  gender: { label: "género", gender: "m" },

  company: { label: "empresa", gender: "f" },
  branch: { label: "sucursal", gender: "f" },
  headquarters: { label: "sede", gender: "f" },

  customer: { label: "cliente", gender: "m" },
  supplier: { label: "proveedor", gender: "m" },
  employee: { label: "empleado", gender: "m" },
  doctor: { label: "doctor", gender: "m" },
  veterinarian: { label: "veterinario", gender: "m" },
  trainer: { label: "entrenador", gender: "m" },
  receptionist: { label: "recepcionista", gender: "m" },
  cashier: { label: "cajero", gender: "m" },
  user: { label: "usuario", gender: "m" },
  role: { label: "rol", gender: "m" },
  permission: { label: "permiso", gender: "m" },

  patient: { label: "paciente", gender: "m" },
  pet: { label: "mascota", gender: "f" },
  species: { label: "especie", gender: "f" },
  breed: { label: "raza", gender: "f" },
  owner: { label: "propietario", gender: "m" },
  weight: { label: "peso", gender: "m" },
  height: { label: "altura", gender: "f" },
  age: { label: "edad", gender: "f" },

  appointment: { label: "cita", gender: "f" },
  schedule: { label: "horario", gender: "m" },
  calendar: { label: "calendario", gender: "m" },
  consultation: { label: "consulta", gender: "f" },
  diagnosis: { label: "diagnóstico", gender: "m" },
  treatment: { label: "tratamiento", gender: "m" },
  prescription: { label: "receta", gender: "f" },
  medicalRecord: { label: "historia clínica", gender: "f" },

  product: { label: "producto", gender: "m" },
  service: { label: "servicio", gender: "m" },
  category: { label: "categoría", gender: "f" },
  brand: { label: "marca", gender: "f" },
  model: { label: "modelo", gender: "m" },
  sku: { label: "SKU", gender: "m" },
  barcode: { label: "código de barras", gender: "m" },
  stock: { label: "stock", gender: "m" },
  quantity: { label: "cantidad", gender: "f" },
  unit: { label: "unidad", gender: "f" },

  sale: { label: "venta", gender: "f" },
  purchase: { label: "compra", gender: "f" },
  order: { label: "pedido", gender: "m" },
  invoice: { label: "factura", gender: "f" },
  receipt: { label: "boleta", gender: "f" },
  payment: { label: "pago", gender: "m" },
  paymentMethod: { label: "método de pago", gender: "m" },
  discount: { label: "descuento", gender: "m" },
  tax: { label: "impuesto", gender: "m" },
  subtotal: { label: "subtotal", gender: "m" },
  total: { label: "total", gender: "m" },
  balance: { label: "saldo", gender: "m" },

  membership: { label: "membresía", gender: "f" },
  plan: { label: "plan", gender: "m" },
  subscription: { label: "suscripción", gender: "f" },
  attendance: { label: "asistencia", gender: "f" },
  assistance: { label: "asistencia", gender: "f" },

  title: { label: "título", gender: "m" },
  description: { label: "descripción", gender: "f" },
  notes: { label: "observaciones", gender: "f" },
  comment: { label: "comentario", gender: "m" },
  reason: { label: "motivo", gender: "m" },

  type: { label: "tipo", gender: "m" },
  status: { label: "estado", gender: "m" },
  priority: { label: "prioridad", gender: "f" },
  source: { label: "origen", gender: "m" },

  date: { label: "fecha", gender: "f" },
  start: { label: "inicio", gender: "m" },
  end: { label: "fin", gender: "m" },
  startDate: { label: "fecha de inicio", gender: "f" },
  endDate: { label: "fecha de fin", gender: "f" },
  createdAt: { label: "fecha de creación", gender: "f" },
  updatedAt: { label: "fecha de actualización", gender: "f" },
  deletedAt: { label: "fecha de eliminación", gender: "f" },
  time: { label: "hora", gender: "f" },
  duration: { label: "duración", gender: "f" },

  amount: { label: "importe", gender: "m" },
  price: { label: "precio", gender: "m" },
  cost: { label: "costo", gender: "m" },
  value: { label: "valor", gender: "m" },
  percentage: { label: "porcentaje", gender: "m" },

  image: { label: "imagen", gender: "f" },
  photo: { label: "foto", gender: "f" },
  avatar: { label: "avatar", gender: "m" },
  logo: { label: "logotipo", gender: "m" },
  icon: { label: "ícono", gender: "m" },

  file: { label: "archivo", gender: "m" },
  files: { label: "archivos", gender: "m" },
  documentFile: { label: "documento", gender: "m" },
  attachment: { label: "adjunto", gender: "m" },
  attachments: { label: "adjuntos", gender: "m" },
  filename: { label: "nombre del archivo", gender: "m" },
  originalName: { label: "nombre original", gender: "m" },
  extension: { label: "extensión", gender: "f" },
  mime: { label: "tipo MIME", gender: "m" },
  mimeType: { label: "tipo MIME", gender: "m" },
  contentType: { label: "tipo de contenido", gender: "m" },
  size: { label: "tamaño", gender: "m" },
  expires: { label: "expiración", gender: "m" },
  fileSize: { label: "tamaño del archivo", gender: "m" },
  path: { label: "ruta", gender: "f" },
  url: { label: "URL", gender: "f" },
  checksum: { label: "checksum", gender: "m" },
  hash: { label: "hash", gender: "m" },

  active: { label: "activo", gender: "m" },
  enabled: { label: "habilitado", gender: "m" },
  visible: { label: "visible", gender: "m" },
  verified: { label: "verificado", gender: "m" },
  published: { label: "publicado", gender: "m" },
  featured: { label: "destacado", gender: "m" },

  color: { label: "color", gender: "m" },
  language: { label: "idioma", gender: "m" },
  currency: { label: "moneda", gender: "f" },
  timezone: { label: "zona horaria", gender: "f" },
};

function article(gender) {
  return gender === "f" ? "La" : "El";
}

function requested(gender) {
  return gender === "f" ? "solicitada" : "solicitado";
}

function obligatory(gender) {
  return gender === "f" ? "obligatoria" : "obligatorio";
}

function valid(gender) {
  return gender === "f" ? "válida" : "válido";
}

function created(gender) {
  return gender === "f" ? "creada" : "creado";
}

function updated(gender) {
  return gender === "f" ? "actualizada" : "actualizado";
}

function deleted(gender) {
  return gender === "f" ? "eliminada" : "eliminado";
}

function fieldInfo(fieldName, dictionary) {
  const field = dictionary?.fields?.[fieldName] || fallbackLabels[fieldName];
  if (field?.label) {
    return {
      label: field.label,
      gender: field.gender === "f" ? "f" : "m",
    };
  }

  return {
    label: fieldName
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .toLowerCase(),
    gender: "m",
  };
}

function entityInfo(meta) {
  const fromDictionary = meta.dictionary?.entity;
  if (fromDictionary?.label) {
    return {
      label: fromDictionary.label,
      gender: fromDictionary.gender === "f" ? "f" : "m",
    };
  }

  const key = camelCase(meta.modelName);
  const fallback = fallbackLabels[key];
  if (fallback) return fallback;

  return {
    label: key,
    gender: "m",
  };
}

function requiredMessage(fieldName, dictionary) {
  const field = fieldInfo(fieldName, dictionary);
  return `${article(field.gender)} ${field.label} es ${obligatory(field.gender)}.`;
}

function enumMessage(fieldName, dictionary) {
  const field = fieldInfo(fieldName, dictionary);
  return `${article(field.gender)} ${field.label} no es ${valid(field.gender)}.`;
}

function minMessage(fieldName, value, dictionary) {
  const field = fieldInfo(fieldName, dictionary);
  if (Number(value) === 0)
    return `${article(field.gender)} ${field.label} no puede ser negativo.`;
  return `${article(field.gender)} ${field.label} debe ser mayor o igual a ${value}.`;
}

function maxMessage(fieldName, value, dictionary) {
  const field = fieldInfo(fieldName, dictionary);
  return `${article(field.gender)} ${field.label} debe ser menor o igual a ${value}.`;
}

function minLengthMessage(fieldName, value, dictionary) {
  const field = fieldInfo(fieldName, dictionary);
  return `${article(field.gender)} ${field.label} debe tener al menos ${value} caracteres.`;
}

function maxLengthMessage(fieldName, value, dictionary) {
  const field = fieldInfo(fieldName, dictionary);
  return `${article(field.gender)} ${field.label} debe tener como máximo ${value} caracteres.`;
}

function responseMessages(meta) {
  const entity = entityInfo(meta);
  const name = entity.label;
  const gender = entity.gender;

  return {
    notFound: `${article(gender)} ${name} ${requested(gender)} no fue ${gender === "f" ? "encontrada" : "encontrado"}.`,
    created: `${article(gender)} ${name} fue ${created(gender)} exitosamente.`,
    updated: `${article(gender)} ${name} fue ${updated(gender)} exitosamente.`,
    deleted: `${article(gender)} ${name} fue ${deleted(gender)} exitosamente.`,
    blocked: `${article(gender)} ${name} no puede ser ${gender === "f" ? "modificada" : "modificado"} por su estado actual.`,
  };
}

/*
────────────────────────────────────────────────────────────
REGION: file discovery
────────────────────────────────────────────────────────────
*/
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(value) {
  return fs.existsSync(value);
}

function findProject(projectName) {
  const cwd = process.cwd();
  const direct = path.join(cwd, projectName);

  if (exists(direct)) return { projectName, projectDir: direct };

  const singular = projectName.endsWith("s") ? projectName.slice(0, -1) : null;
  if (singular) {
    const singularPath = path.join(cwd, singular);
    if (exists(singularPath)) {
      warn(`No existe "${projectName}". Usaré "${singular}".`);
      return { projectName: singular, projectDir: singularPath };
    }
  }

  throw new Error(`No existe el proyecto: ${projectName}`);
}

function findServerDir(projectDir, projectName) {
  const expected = path.join(projectDir, `${projectName}-server`);
  if (exists(expected)) return expected;

  const candidates = fs
    .readdirSync(projectDir, { withFileTypes: true })
    .filter((item) => item.isDirectory() && item.name.endsWith("-server"))
    .map((item) => path.join(projectDir, item.name));

  if (candidates.length) return candidates[0];

  return expected;
}

function findWebDir(projectDir, projectName) {
  const expected = path.join(projectDir, `${projectName}-web`);
  if (exists(expected)) return expected;

  const candidates = fs
    .readdirSync(projectDir, { withFileTypes: true })
    .filter((item) => item.isDirectory() && item.name.endsWith("-web"))
    .map((item) => path.join(projectDir, item.name));

  if (candidates.length) return candidates[0];

  return expected;
}

function findSchemaFiles(appDir) {
  const results = [];

  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (["node_modules", ".git", "dist", "build"].includes(item.name))
          continue;
        walk(fullPath);
        continue;
      }

      if (!item.isFile()) continue;
      if (item.name === "schemas.js") continue;
      if (item.name === "schema.js" || item.name.endsWith(".schema.js")) {
        results.push(fullPath);
      }
    }
  }

  if (exists(appDir)) walk(appDir);
  return results.sort();
}

/*
────────────────────────────────────────────────────────────
REGION: balanced parser
────────────────────────────────────────────────────────────
*/
function findMatching(text, startIndex, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function extractBalancedAfter(text, token, openChar = "{", closeChar = "}") {
  const tokenIndex = text.indexOf(token);
  if (tokenIndex < 0) return null;

  const start = text.indexOf(openChar, tokenIndex);
  if (start < 0) return null;

  const end = findMatching(text, start, openChar, closeChar);
  if (end < 0) return null;

  return {
    start,
    end,
    value: text.slice(start, end + 1),
  };
}

function splitTopLevelProperties(objectText) {
  const inner = objectText.trim().replace(/^\{/, "").replace(/\}$/, "");
  const properties = [];
  let index = 0;

  while (index < inner.length) {
    while (/[\s,]/.test(inner[index] || "")) index += 1;
    if (index >= inner.length) break;

    const keyStart = index;
    let key = "";

    if (inner[index] === '"' || inner[index] === "'") {
      const quote = inner[index];
      index += 1;
      const valueStart = index;
      while (index < inner.length && inner[index] !== quote) index += 1;
      key = inner.slice(valueStart, index);
      index += 1;
    } else {
      while (index < inner.length && /[A-Za-z0-9_$]/.test(inner[index]))
        index += 1;
      key = inner.slice(keyStart, index);
    }

    while (/\s/.test(inner[index] || "")) index += 1;
    if (inner[index] !== ":") break;
    index += 1;
    while (/\s/.test(inner[index] || "")) index += 1;

    const valueStart = index;
    let valueEnd = index;

    if (inner[index] === "{") {
      const end = findMatching(inner, index, "{", "}");
      valueEnd = end + 1;
    } else if (inner[index] === "[") {
      const end = findMatching(inner, index, "[", "]");
      valueEnd = end + 1;
    } else {
      while (valueEnd < inner.length && inner[valueEnd] !== ",") valueEnd += 1;
    }

    const fullStart = keyStart;
    const fullEnd = valueEnd;
    properties.push({
      key,
      value: inner.slice(valueStart, valueEnd).trim(),
      full: inner.slice(fullStart, fullEnd),
    });

    index = valueEnd + 1;
  }

  return properties.filter((item) => item.key);
}

/*
────────────────────────────────────────────────────────────
REGION: schema extraction
────────────────────────────────────────────────────────────
*/
function readDictionary(text) {
  const dictionaryBlock = extractBalancedAfter(text, "dictionary", "{", "}");
  if (!dictionaryBlock) return {};

  try {
    // Se espera un objeto literal simple. No requiere mongoose ni dependencias.
    return Function(`"use strict"; return (${dictionaryBlock.value});`)();
  } catch (_) {
    return {};
  }
}

function extractModelName(text, filePath) {
  const match = text.match(/mongoose\.model\(\s*["']([^"']+)["']/);
  if (match) return match[1];

  const base = path
    .basename(filePath)
    .replace(/\.schema\.js$/, "")
    .replace(/\.js$/, "");
  return pascalCase(
    base === "schema" ? path.basename(path.dirname(filePath)) : base,
  );
}

function extractCollection(text, modelName) {
  const match = text.match(/collection\s*:\s*["']([^"']+)["']/);
  if (match) return match[1];
  return pluralize(camelCase(modelName));
}

function extractSchemaDefinition(text) {
  const schemaIndex = text.search(/new\s+mongoose\.Schema\s*\(/);
  if (schemaIndex < 0) return null;

  const firstObjectStart = text.indexOf("{", schemaIndex);
  if (firstObjectStart < 0) return null;

  const firstObjectEnd = findMatching(text, firstObjectStart, "{", "}");
  if (firstObjectEnd < 0) return null;

  return {
    start: firstObjectStart,
    end: firstObjectEnd,
    value: text.slice(firstObjectStart, firstObjectEnd + 1),
  };
}

function getFieldType(block) {
  if (/Schema\.Types\.ObjectId|Types\.ObjectId/.test(block)) return "objectId";
  if (/type\s*:\s*Map\b/.test(block)) return "map";
  if (/type\s*:\s*String\b/.test(block)) return "string";
  if (/type\s*:\s*Number\b/.test(block)) return "number";
  if (/type\s*:\s*Boolean\b/.test(block)) return "boolean";
  if (/type\s*:\s*Date\b/.test(block)) return "date";
  if (/type\s*:\s*mongoose\.Schema\.Types\.Mixed\b/.test(block)) return "mixed";
  if (/type\s*:\s*Schema\.Types\.Mixed\b/.test(block)) return "mixed";
  if (/^\s*Map\s*$/.test(block)) return "map";
  if (/^\s*String\s*$/.test(block)) return "string";
  if (/^\s*Number\s*$/.test(block)) return "number";
  if (/^\s*Boolean\s*$/.test(block)) return "boolean";
  if (/^\s*Date\s*$/.test(block)) return "date";
  if (/^\s*(mongoose\.)?Schema\.Types\.Mixed\s*$/.test(block)) return "mixed";
  if (/^\s*Types\.Mixed\s*$/.test(block)) return "mixed";
  return "mixed";
}

function extractEnumValues(block) {
  const simple = block.match(/enum\s*:\s*(\[[\s\S]*?\])/);
  if (simple) {
    try {
      const values = Function(`"use strict"; return (${simple[1]});`)();
      if (Array.isArray(values)) return values;
    } catch (_) {}
  }

  const objectValues = block.match(/values\s*:\s*(\[[\s\S]*?\])/);
  if (objectValues) {
    try {
      const values = Function(`"use strict"; return (${objectValues[1]});`)();
      if (Array.isArray(values)) return values;
    } catch (_) {}
  }

  return null;
}

function extractNumberOption(block, key) {
  const arrayMatch = block.match(
    new RegExp(`${key}\\s*:\\s*\\[\\s*(-?\\d+(?:\\.\\d+)?)`),
  );
  if (arrayMatch) return Number(arrayMatch[1]);

  const simpleMatch = block.match(
    new RegExp(`${key}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`),
  );
  if (simpleMatch) return Number(simpleMatch[1]);

  return undefined;
}

function extractRef(block) {
  const match = block.match(/ref\s*:\s*["']([^"']+)["']/);
  return match?.[1];
}

function isRequired(block) {
  return (
    /required\s*:\s*true/.test(block) || /required\s*:\s*\[\s*true/.test(block)
  );
}

function isArrayBlock(value) {
  return value.trim().startsWith("[");
}

function topLevelValue(block, key) {
  const normalized = normalizeFieldBlock(block);
  if (!normalized.startsWith("{")) return null;

  const property = splitTopLevelProperties(normalized).find(
    (item) => item.key === key,
  );

  return property?.value || null;
}

function typeDescriptorFromBlock(block) {
  const normalized = normalizeFieldBlock(block);

  if (normalized.startsWith("{") && hasTopLevelKey(normalized, "type")) {
    return {
      type: getFieldType(normalized),
      ref: extractRef(normalized),
      enum: extractEnumValues(normalized),
      min: extractNumberOption(normalized, "min"),
      max: extractNumberOption(normalized, "max"),
      minlength: extractNumberOption(normalized, "minlength"),
      maxlength: extractNumberOption(normalized, "maxlength"),
      pattern: extractPatternOption(normalized),
      default: extractDefaultOption(normalized),
      mapOf: extractMapOfOption(normalized),
    };
  }

  return {
    type: getFieldType(normalized),
    ref: extractRef(normalized),
    enum: extractEnumValues(normalized),
    min: extractNumberOption(normalized, "min"),
    max: extractNumberOption(normalized, "max"),
    minlength: extractNumberOption(normalized, "minlength"),
    maxlength: extractNumberOption(normalized, "maxlength"),
    pattern: extractPatternOption(normalized),
    default: null,
    mapOf: extractMapOfOption(normalized),
  };
}

function extractMapOfOption(block) {
  const value = topLevelValue(block, "of");
  if (!value) return { type: "mixed" };

  const normalized = normalizeFieldBlock(value);

  if (normalized.startsWith("[")) {
    return {
      type: "array",
      item: parseArrayItem(normalized),
    };
  }

  if (normalized.startsWith("{") && !hasTopLevelKey(normalized, "type")) {
    return {
      type: "object",
      fields: parseFields(normalized),
    };
  }

  return typeDescriptorFromBlock(normalized);
}

function extractDefaultOption(block) {
  const value = topLevelValue(block, "default");
  if (!value) return null;

  const code = value.trim();

  if (/^Date\.now\b/.test(code)) {
    return { code: "Date.now", kind: "dateNow" };
  }

  if (/^(true|false|null|-?\d+(?:\.\d+)?)$/.test(code)) {
    return { code, kind: "literal" };
  }

  if (/^["']/.test(code)) {
    try {
      const value = Function(`"use strict"; return (${code});`)();
      return { code: jsString(value), kind: "literal" };
    } catch (_) {
      return null;
    }
  }

  if (code.startsWith("[") || code.startsWith("{")) {
    return { code, kind: "literal" };
  }

  return null;
}

function extractPatternOption(block) {
  const arrayMatch = block.match(
    /(?:match|pattern)\s*:\s*\[\s*(\/[^/\n]+\/[gimsuy]*)\s*,\s*(["'][\s\S]*?["'])\s*\]/,
  );
  if (arrayMatch) {
    try {
      const message = Function(`"use strict"; return (${arrayMatch[2]});`)();
      return { pattern: arrayMatch[1], message };
    } catch (_) {
      return { pattern: arrayMatch[1] };
    }
  }

  const simpleMatch = block.match(
    /(?:match|pattern|regex)\s*:\s*(\/[^/\n]+\/[gimsuy]*)/,
  );
  if (simpleMatch) return { pattern: simpleMatch[1] };

  return null;
}

function normalizeFieldBlock(value) {
  return String(value || "").trim();
}

function hasTopLevelKey(objectText, key) {
  if (!normalizeFieldBlock(objectText).startsWith("{")) return false;
  return splitTopLevelProperties(objectText).some(
    (property) => property.key === key,
  );
}

function isSchemaObjectBlock(value) {
  const block = normalizeFieldBlock(value);
  return block.startsWith("{") && !hasTopLevelKey(block, "type");
}

function parseArrayItem(block) {
  const trimmed = normalizeFieldBlock(block);
  const start = trimmed.indexOf("[");
  if (start < 0) return { type: "mixed" };

  let index = start + 1;
  while (/\s/.test(trimmed[index] || "")) index += 1;

  if (trimmed[index] === "{") {
    const end = findMatching(trimmed, index, "{", "}");
    if (end >= 0) {
      const objectText = trimmed.slice(index, end + 1);
      if (hasTopLevelKey(objectText, "type")) {
        return typeDescriptorFromBlock(objectText);
      }

      return {
        type: "object",
        fields: parseFields(objectText),
      };
    }
  }

  const rest = trimmed.slice(index).replace(/\].*$/, "").trim();
  return typeDescriptorFromBlock(rest);
}

function parseField(property) {
  const block = property.value;
  const array = isArrayBlock(block);
  const object = isSchemaObjectBlock(block);
  const item = array ? parseArrayItem(block) : null;

  return {
    name: property.key,
    block,
    array,
    object,
    type: array ? "array" : object ? "object" : getFieldType(block),
    item,
    fields: object ? parseFields(block) : [],
    ref: extractRef(block),
    required: isRequired(block),
    enum: extractEnumValues(block),
    min: extractNumberOption(block, "min"),
    max: extractNumberOption(block, "max"),
    minlength: extractNumberOption(block, "minlength"),
    maxlength: extractNumberOption(block, "maxlength"),
    pattern: extractPatternOption(block),
    default: extractDefaultOption(block),
    mapOf: extractMapOfOption(block),
  };
}

function parseFields(definitionText) {
  return splitTopLevelProperties(definitionText)
    .filter((property) => !property.key.startsWith("_"))
    .map(parseField);
}

function schemaMeta(filePath, appDir) {
  const text = fs.readFileSync(filePath, "utf8");
  const dictionary = readDictionary(text);
  const modelName = extractModelName(text, filePath);
  const collection = extractCollection(text, modelName);
  const definition = extractSchemaDefinition(text);
  const fields = definition ? parseFields(definition.value) : [];
  const base =
    path.basename(filePath) === "schema.js"
      ? path.basename(path.dirname(filePath))
      : path.basename(filePath).replace(/\.schema\.js$/, "");

  return {
    filePath,
    appDir,
    text,
    dictionary,
    modelName,
    schemaExportName: `${modelName}Schema`,
    resource: camelCase(modelName),
    collection,
    route: `/${kebabToRoute(collection)}`,
    fields,
    base,
    dir: path.dirname(filePath),
    validatorsPath: path.join(appDir, "validators.js"),
    staleValidatorPath: path.join(
      path.dirname(filePath),
      `${base}.validator.js`,
    ),
    routerPath: path.join(path.dirname(filePath), `${base}.router.js`),
  };
}

/*
────────────────────────────────────────────────────────────
REGION: schema consolidation
────────────────────────────────────────────────────────────
*/
function updateFieldBlock(field, dictionary) {
  let block = field.block;

  block = block.replace(
    /required\s*:\s*(?:true|\[\s*true\s*,\s*["'`][\s\S]*?["'`]\s*\])/,
    `required: [true, ${jsString(requiredMessage(field.name, dictionary))}]`,
  );

  block = block.replace(
    /enum\s*:\s*(?:\[[\s\S]*?\]|\{\s*values\s*:\s*(\[[\s\S]*?\])\s*,\s*message\s*:\s*["'`][\s\S]*?["'`]\s*,?\s*\})/,
    (match, values) => {
      const enumValues = values ?? match.match(/\[[\s\S]*\]/)[0];

      return `enum: {
        values: ${enumValues},
        message: ${jsString(enumMessage(field.name, dictionary))},
      }`;
    },
  );

  block = block.replace(
    /min\s*:\s*(?:\[\s*(-?\d+(?:\.\d+)?)\s*,\s*["'`][\s\S]*?["'`]\s*\]|(-?\d+(?:\.\d+)?))/,
    (_, value1, value2) => {
      const value = value1 ?? value2;
      return `min: [${value}, ${jsString(minMessage(field.name, value, dictionary))}]`;
    },
  );

  block = block.replace(
    /max\s*:\s*(?:\[\s*(-?\d+(?:\.\d+)?)\s*,\s*["'`][\s\S]*?["'`]\s*\]|(-?\d+(?:\.\d+)?))/,
    (_, value1, value2) => {
      const value = value1 ?? value2;
      return `max: [${value}, ${jsString(maxMessage(field.name, value, dictionary))}]`;
    },
  );

  block = block.replace(
    /minlength\s*:\s*(?:\[\s*(\d+)\s*,\s*["'`][\s\S]*?["'`]\s*\]|(\d+))/,
    (_, value1, value2) => {
      const value = value1 ?? value2;
      return `minlength: [${value}, ${jsString(minLengthMessage(field.name, value, dictionary))}]`;
    },
  );

  block = block.replace(
    /maxlength\s*:\s*(?:\[\s*(\d+)\s*,\s*["'`][\s\S]*?["'`]\s*\]|(\d+))/,
    (_, value1, value2) => {
      const value = value1 ?? value2;
      return `maxlength: [${value}, ${jsString(maxLengthMessage(field.name, value, dictionary))}]`;
    },
  );

  return block;
}

function consolidateSchema(meta) {
  const definition = extractSchemaDefinition(meta.text);
  if (!definition) return false;

  const properties = splitTopLevelProperties(definition.value);
  let changed = false;
  let definitionText = definition.value;

  // Reemplazos descendentes para no mover índices.
  const replacements = [];
  let cursor = 1;

  for (const property of properties) {
    const absoluteStart = definitionText.indexOf(property.value, cursor);
    if (absoluteStart < 0) continue;
    const absoluteEnd = absoluteStart + property.value.length;
    cursor = absoluteEnd;

    const field = meta.fields.find((item) => item.name === property.key);
    if (!field) continue;

    const updated = updateFieldBlock(field, meta.dictionary);
    if (updated !== property.value) {
      changed = true;
      replacements.push({
        start: absoluteStart,
        end: absoluteEnd,
        value: updated,
      });
    }
  }

  for (const item of replacements.sort((a, b) => b.start - a.start)) {
    definitionText = `${definitionText.slice(0, item.start)}${item.value}${definitionText.slice(item.end)}`;
  }

  if (!changed) return false;

  const updatedText = `${meta.text.slice(0, definition.start)}${definitionText}${meta.text.slice(definition.end + 1)}`;
  fs.writeFileSync(meta.filePath, updatedText, "utf8");
  return true;
}

/*
────────────────────────────────────────────────────────────
REGION: schemas.js generation
────────────────────────────────────────────────────────────
*/
function generateSchemasIndex(appDir, metas) {
  const lines = [];

  for (const meta of metas) {
    const requirePath = makeRequirePath(appDir, meta.filePath);
    lines.push(
      `const ${meta.schemaExportName} = require(${jsString(requirePath)});`,
    );
  }

  lines.push("");
  lines.push("module.exports = {");
  for (const meta of metas) lines.push(`  ${meta.schemaExportName},`);
  lines.push("};");
  lines.push("");

  const output = lines.join("\n");
  const outputPath = path.join(appDir, "schemas.js");
  fs.writeFileSync(outputPath, output, "utf8");
  return outputPath;
}

/*
────────────────────────────────────────────────────────────
REGION: validator generation
────────────────────────────────────────────────────────────
*/
function zodDefaultSuffix(field, mode) {
  if (mode !== "body") return "";
  if (!field.default) return "";

  if (field.default.kind === "dateNow") {
    return ".default(() => new Date().toISOString())";
  }

  return `.default(${field.default.code})`;
}

function optionalSuffix(field, mode) {
  if (mode === "array") return "";
  if (mode === "query") return ".optional()";
  if (field.default) return "";
  if (!field.required) return ".optional()";
  return "";
}

function zodForMapValue(value, meta, mode) {
  const descriptor = value || { type: "mixed" };

  if (descriptor.type === "array") {
    const itemField = {
      name: "item",
      item: descriptor.item || { type: "mixed" },
      array: true,
      object: false,
      type: "array",
      required: false,
      default: null,
    };

    return `z.array(${zodForArrayItem(itemField, meta, mode)})`;
  }

  if (descriptor.type === "object") {
    const fakeField = {
      name: "value",
      fields: descriptor.fields || [],
      object: true,
      array: false,
      type: "object",
      required: false,
      default: null,
    };

    return zodForObject(fakeField, meta, mode);
  }

  const fakeField = {
    name: "value",
    type: descriptor.type || "mixed",
    ref: descriptor.ref,
    enum: descriptor.enum,
    min: descriptor.min,
    max: descriptor.max,
    minlength: descriptor.minlength,
    maxlength: descriptor.maxlength,
    pattern: descriptor.pattern,
    default: null,
    required: false,
    array: false,
    object: false,
    fields: [],
    mapOf: descriptor.mapOf,
  };

  return zodForField(fakeField, meta, "array");
}
function zodForArrayItem(field, meta, mode) {
  const item = field.item || { type: "mixed" };
  const fakeField = {
    ...field,
    type: item.type,
    ref: item.ref,
    enum: item.enum,
    min: item.min,
    max: item.max,
    minlength: item.minlength,
    maxlength: item.maxlength,
    pattern: item.pattern,
    default: null,
    required: false,
    array: false,
    object: item.type === "object",
    fields: item.fields || [],
    mapOf: item.mapOf,
  };

  if (item.type === "object") {
    const lines = (item.fields || [])
      .filter((child) => child.name !== "company")
      .map((child) => `    ${child.name}: ${zodForField(child, meta, mode)},`);
    return `z.object({\n${lines.join("\n")}\n  })`;
  }

  return zodForField(fakeField, meta, "array");
}

function zodForObject(field, meta, mode) {
  const lines = (field.fields || [])
    .filter((child) => child.name !== "company")
    .map((child) => `    ${child.name}: ${zodForField(child, meta, mode)},`);

  return `z.object({\n${lines.join("\n")}\n  })`;
}

function validatorTypeMessage(field, mode) {
  if (mode === "query" || mode === "array")
    return "validatorMessages.invalidType";
  return field.required
    ? "validatorMessages.required"
    : "validatorMessages.invalidType";
}

function validatorMinMessage(value) {
  return Number(value) === 0
    ? "validatorMessages.notNegative"
    : `validatorMessages.min(${value})`;
}

function zodForField(field, meta, mode) {
  let schema;
  const typeMessage = validatorTypeMessage(field, mode);

  if (field.array) {
    schema = `z.array(${zodForArrayItem(field, meta, mode)}, { message: ${typeMessage} })`;
  } else if (field.object) {
    schema = zodForObject(field, meta, mode);
  } else if (field.enum?.length) {
    schema = `z.enum(${JSON.stringify(field.enum)}, { message: validatorMessages.invalidValue })`;
  } else if (field.type === "objectId") {
    schema = `objectIdSchema`;
  } else if (field.type === "number") {
    schema = `z.coerce.number({ message: ${typeMessage} })`;
    const minValue = field.min !== undefined ? field.min : 0;
    schema += `.min(${minValue}, ${validatorMinMessage(minValue)})`;
    if (field.max !== undefined) {
      schema += `.max(${field.max}, validatorMessages.max(${field.max}))`;
    }
  } else if (field.type === "boolean") {
    schema =
      mode === "query"
        ? `booleanQuerySchema`
        : `z.boolean({ message: ${typeMessage} })`;
  } else if (field.type === "date") {
    schema = `z.string({ message: ${typeMessage} }).datetime({ message: validatorMessages.invalidDate })`;
  } else if (field.type === "map") {
    schema = `z.record(z.string({ message: validatorMessages.invalidType }), ${zodForMapValue(field.mapOf, meta, mode)})`;
  } else if (field.type === "string") {
    schema = `z.string({ message: ${typeMessage} })`;
    if (field.minlength !== undefined) {
      schema += `.min(${field.minlength}, validatorMessages.minLength(${field.minlength}))`;
    }
    if (field.maxlength !== undefined) {
      schema += `.max(${field.maxlength}, validatorMessages.maxLength(${field.maxlength}))`;
    }
    if (field.required && field.minlength === undefined) {
      schema += `.min(1, validatorMessages.required)`;
    }
    if (field.pattern?.pattern) {
      schema += `.regex(${field.pattern.pattern}, validatorMessages.invalidFormat)`;
    }
  } else {
    schema = "z.any()";
  }

  schema += zodDefaultSuffix(field, mode);
  schema += optionalSuffix(field, mode);
  return schema;
}

function queryFieldLines(meta) {
  const lines = [
    `  page: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).default(1),`,
    `  perPage: z.coerce.number({ message: validatorMessages.invalidType }).int(validatorMessages.integer).min(1, validatorMessages.min(1)).max(100, validatorMessages.max(100)).default(10),`,
  ];

  for (const field of meta.fields) {
    if (["company", "createdAt", "updatedAt"].includes(field.name)) continue;
    if (
      field.array ||
      field.object ||
      field.type === "mixed" ||
      field.type === "map"
    ) {
      continue;
    }
    if (field.type === "date") {
      lines.push(`  ${field.name}: dateRangeQuerySchema.optional(),`);
      continue;
    }
    lines.push(`  ${field.name}: ${zodForField(field, meta, "query")},`);
  }

  return lines;
}

function bodyFieldLines(meta) {
  const lines = [`  id: objectIdSchema.optional(),`];

  for (const field of meta.fields) {
    if (["company", "createdAt", "updatedAt"].includes(field.name)) continue;
    lines.push(`  ${field.name}: ${zodForField(field, meta, "body")},`);
  }

  return lines;
}

function validationExportNames(meta) {
  const pluralPascal = pascalCase(meta.collection);
  const singularPascal = pascalCase(meta.modelName);

  return {
    search: `search${pluralPascal}QuerySchema`,
    upsert: `upsert${singularPascal}BodySchema`,
    get: `get${singularPascal}ParamsSchema`,
    remove: `delete${singularPascal}ParamsSchema`,
  };
}

function pushValidationSchemas(lines, meta) {
  const names = validationExportNames(meta);

  lines.push(`const ${names.search} = z.object({`);
  lines.push(...queryFieldLines(meta));
  lines.push(`});`);
  lines.push("");
  lines.push(`const ${names.upsert} = z.object({`);
  lines.push(...bodyFieldLines(meta));
  lines.push(`});`);
  lines.push("");
  lines.push(`const ${names.get} = idParamsSchema;`);
  lines.push("");
  lines.push(`const ${names.remove} = idParamsSchema;`);
  lines.push("");
}

function generateValidatorsIndex(appDir, metas) {
  const outputPath = path.join(appDir, "validators.js");
  const exportNames = [];
  const lines = [];

  lines.push(`const { z } = require("zod");`);
  lines.push("");
  lines.push(`const validatorMessages = {`);
  lines.push(`  required: "Campo obligatorio",`);
  lines.push(`  objectId: "El identificador no es válido.",`);
  lines.push(`  invalidType: "Tipo de dato inválido",`);
  lines.push(`  tooSmall: "El valor es demasiado pequeño",`);
  lines.push(`  tooBig: "El valor es demasiado grande",`);
  lines.push(`  invalidString: "Formato de texto inválido",`);
  lines.push(`  invalidFormat: "Formato inválido",`);
  lines.push(`  invalidEnumValue: "Valor no permitido",`);
  lines.push(`  invalidValue: "Valor no permitido",`);
  lines.push(`  invalidLiteral: "Valor no permitido",`);
  lines.push(`  unrecognizedKeys: "Campos no permitidos",`);
  lines.push(`  invalidUnion: "No coincide con ningún formato permitido",`);
  lines.push(`  invalidDate: "Fecha inválida",`);
  lines.push(`  notFinite: "El número no es válido",`);
  lines.push(
    `  notMultipleOf: "El número no cumple con el múltiplo requerido",`,
  );
  lines.push(`  integer: "El número debe ser entero",`);
  lines.push(`  notNegative: "El valor no puede ser negativo",`);
  lines.push(`  custom: "No cumple con la validación requerida",`);
  lines.push(`  validationError: "Error de validación",`);
  lines.push(`  unexpected: "Ocurrió un error inesperado.",`);
  lines.push(
    `  min: (value) => \`El valor debe ser mayor o igual a \${value}\`,`,
  );
  lines.push(
    `  max: (value) => \`El valor debe ser menor o igual a \${value}\`,`,
  );
  lines.push(
    `  minLength: (value) => \`Debe tener al menos \${value} caracteres\`,`,
  );
  lines.push(
    `  maxLength: (value) => \`Debe tener como máximo \${value} caracteres\`,`,
  );
  lines.push(`};`);
  lines.push("");
  lines.push(`const objectIdSchema = z`);
  lines.push(`  .string({ message: validatorMessages.required })`);
  lines.push(`  .regex(/^[0-9a-fA-F]{24}$/, validatorMessages.objectId);`);
  lines.push("");
  lines.push(`const booleanQuerySchema = z`);
  lines.push(
    `  .enum(["true", "false"], { message: validatorMessages.invalidValue })`,
  );
  lines.push(`  .transform((value) => value === "true");`);
  lines.push("");
  lines.push(`const dateRangeQuerySchema = z.object({`);
  lines.push(
    `  from: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),`,
  );
  lines.push(
    `  to: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),`,
  );
  lines.push(`});`);
  lines.push("");
  lines.push(`const idParamsSchema = z.object({`);
  lines.push(`  id: objectIdSchema,`);
  lines.push(`});`);
  lines.push("");

  for (const meta of metas) {
    const names = validationExportNames(meta);
    exportNames.push(names.search, names.upsert, names.get, names.remove);
    pushValidationSchemas(lines, meta);
  }

  lines.push(`module.exports = {`);
  lines.push(`  validatorMessages,`);
  lines.push(`  objectIdSchema,`);
  lines.push(`  booleanQuerySchema,`);
  lines.push(`  dateRangeQuerySchema,`);
  lines.push(`  idParamsSchema,`);
  for (const name of exportNames) {
    lines.push(`  ${name},`);
  }
  lines.push(`};`);
  lines.push("");

  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
  return outputPath;
}

function cleanupStaleValidators(appDir, metas) {
  const removedFiles = [];
  const oldCentralPath = path.join(appDir, "validations.js");

  if (exists(oldCentralPath)) {
    fs.unlinkSync(oldCentralPath);
    removedFiles.push(oldCentralPath);
  }

  for (const meta of metas) {
    if (!exists(meta.staleValidatorPath)) continue;
    fs.unlinkSync(meta.staleValidatorPath);
    removedFiles.push(meta.staleValidatorPath);
  }

  return removedFiles;
}

/*
────────────────────────────────────────────────────────────
REGION: router generation helpers
────────────────────────────────────────────────────────────
*/
function routerRequirePath(meta) {
  return makeRequirePath(meta.dir, path.join(meta.appDir, "schemas.js"));
}

function validatorsRequirePath(meta) {
  return makeRequirePath(meta.dir, path.join(meta.appDir, "validators.js"));
}

function configValidatorRequirePath(meta) {
  return makeRequirePath(
    meta.dir,
    path.join(meta.appDir, "config", "validator.js"),
  );
}

function refMetaMap(metas) {
  return new Map(metas.map((meta) => [meta.modelName, meta]));
}

function routeFieldFilters(meta) {
  const lines = [];

  for (const field of meta.fields) {
    if (["company", "createdAt", "updatedAt"].includes(field.name)) continue;
    if (
      field.array ||
      field.object ||
      field.type === "mixed" ||
      field.type === "map"
    )
      continue;

    if (field.type === "date") {
      lines.push(`      ...(req.query.${field.name} && {`);
      lines.push(`        ${field.name}: {`);
      lines.push(`          ...(req.query.${field.name}.from && {`);
      lines.push(`            $gte: req.query.${field.name}.from,`);
      lines.push(`          }),`);
      lines.push(`          ...(req.query.${field.name}.to && {`);
      lines.push(`            $lte: req.query.${field.name}.to,`);
      lines.push(`          }),`);
      lines.push(`        },`);
      lines.push(`      }),`);
      continue;
    }

    lines.push(`      ...(req.query.${field.name} !== undefined && {`);
    lines.push(`        ${field.name}: req.query.${field.name},`);
    lines.push(`      }),`);
  }

  return lines;
}

const MAX_REF_DEPTH = 3;

function populateObjectCode(field, metas, depth, visited) {
  const refs = refMetaMap(metas);
  const refMeta = refs.get(field.ref);
  const code = [`path: ${jsString(field.name)}`];

  if (depth > 1 && refMeta && !visited.has(field.ref)) {
    const nextVisited = new Set([...visited, field.ref]);
    const nested = refMeta.fields.filter((item) => {
      if (!item.ref || item.name === "company") return false;
      if (nextVisited.has(item.ref)) return false;
      return true;
    });

    if (nested.length === 1) {
      code.push(
        `populate: ${populateObjectCode(nested[0], metas, depth - 1, nextVisited)}`,
      );
    }

    if (nested.length > 1) {
      code.push(
        `populate: [${nested.map((item) => populateObjectCode(item, metas, depth - 1, nextVisited)).join(", ")}]`,
      );
    }
  }

  return `{ ${code.join(", ")} }`;
}

function populateLines(meta, metas, indent = "        ") {
  return meta.fields
    .filter((field) => field.ref && field.name !== "company")
    .map(
      (field) =>
        `${indent}.populate(${populateObjectCode(field, metas, MAX_REF_DEPTH, new Set([meta.modelName]))})`,
    );
}

function pushDomainObject(
  lines,
  accessor,
  targetMeta,
  metas,
  indent,
  depth,
  visited,
) {
  lines.push(`${indent}id: String(${accessor}._id),`);

  if (!targetMeta) return;

  const refs = refMetaMap(metas);

  for (const field of targetMeta.fields) {
    if (["company", "createdAt", "updatedAt"].includes(field.name)) continue;
    if (field.type === "mixed") continue;

    if (field.ref && depth > 1) {
      const refMeta = refs.get(field.ref);
      const accessorField = `${accessor}.${field.name}`;

      if (field.array) {
        lines.push(`${indent}...(Array.isArray(${accessorField}) && {`);
        lines.push(
          `${indent}  ${field.name}: ${accessorField}.map((item) => ({`,
        );
        pushDomainObject(
          lines,
          "item",
          refMeta,
          metas,
          `${indent}    `,
          depth - 1,
          new Set([...visited, field.ref]),
        );
        lines.push(`${indent}  })),`);
        lines.push(`${indent}}),`);
        continue;
      }

      if (refMeta && !visited.has(field.ref)) {
        lines.push(`${indent}...(${accessorField} && {`);
        lines.push(`${indent}  ${field.name}: {`);
        pushDomainObject(
          lines,
          accessorField,
          refMeta,
          metas,
          `${indent}    `,
          depth - 1,
          new Set([...visited, field.ref]),
        );
        lines.push(`${indent}  },`);
        lines.push(`${indent}}),`);
        continue;
      }
    }

    lines.push(`${indent}${field.name}: ${accessor}.${field.name},`);
  }
}

function pushRefObject(lines, field, refMeta, metas, recordName, baseIndent) {
  const accessor = `${recordName}.${field.name}`;

  if (field.array) {
    lines.push(`${baseIndent}...(Array.isArray(${accessor}) && {`);
    lines.push(`${baseIndent}  ${field.name}: ${accessor}.map((item) => ({`);
    pushDomainObject(
      lines,
      "item",
      refMeta,
      metas,
      `${baseIndent}    `,
      MAX_REF_DEPTH,
      new Set([refMeta?.modelName].filter(Boolean)),
    );
    lines.push(`${baseIndent}  })),`);
    lines.push(`${baseIndent}}),`);
    return;
  }

  if (!refMeta) {
    lines.push(`${baseIndent}...(${accessor} && {`);
    lines.push(`${baseIndent}  ${field.name}: ${accessor},`);
    lines.push(`${baseIndent}}),`);
    return;
  }

  lines.push(`${baseIndent}...(${accessor} && {`);
  lines.push(`${baseIndent}  ${field.name}: {`);
  pushDomainObject(
    lines,
    accessor,
    refMeta,
    metas,
    `${baseIndent}    `,
    MAX_REF_DEPTH,
    new Set([refMeta.modelName]),
  );
  lines.push(`${baseIndent}  },`);
  lines.push(`${baseIndent}}),`);
}

function listMapLines(meta, metas) {
  const lines = [];
  const refs = refMetaMap(metas);
  const fields = meta.fields.filter(
    (field) => !["company", "createdAt", "updatedAt"].includes(field.name),
  );

  for (const field of fields) {
    if (field.type === "mixed") continue;

    if (field.ref) {
      pushRefObject(
        lines,
        field,
        refs.get(field.ref),
        metas,
        "record",
        "        ",
      );
      continue;
    }

    lines.push(`        ${field.name}: record.${field.name},`);
  }

  lines.push(`        created: record.createdAt,`);
  lines.push(`        updated: record.updatedAt,`);
  return lines;
}

function detailMapLines(meta, metas) {
  const lines = [];
  const refs = refMetaMap(metas);
  const fields = meta.fields.filter(
    (field) => !["company", "createdAt", "updatedAt"].includes(field.name),
  );

  for (const field of fields) {
    if (field.type === "mixed") continue;

    if (field.ref) {
      pushRefObject(
        lines,
        field,
        refs.get(field.ref),
        metas,
        "record",
        "      ",
      );
      continue;
    }

    lines.push(`      ${field.name}: record.${field.name},`);
  }

  lines.push(`      created: record.createdAt,`);
  lines.push(`      updated: record.updatedAt,`);
  return lines;
}

function blockedStatuses(meta) {
  const statusField = meta.fields.find(
    (field) => field.name === "status" && Array.isArray(field.enum),
  );
  if (!statusField) return "[]";
  const blocked = statusField.enum.filter((value) =>
    ["completed", "cancelled", "consumed", "in-progress"].includes(value),
  );
  return JSON.stringify(blocked);
}

/*
────────────────────────────────────────────────────────────
REGION: router generation
────────────────────────────────────────────────────────────
*/
function generateRouter(meta, metas) {
  const pluralPascal = pascalCase(meta.collection);
  const singularPascal = pascalCase(meta.modelName);
  const messages = responseMessages(meta);
  const blocked = blockedStatuses(meta);

  const lines = [];
  lines.push(`const router = require("express").Router();`);
  lines.push("");
  lines.push(`const {`);
  lines.push(`  ${meta.schemaExportName},`);
  lines.push(`} = require(${jsString(routerRequirePath(meta))});`);
  lines.push("");
  lines.push(`const {`);
  lines.push(`  search${pluralPascal}QuerySchema,`);
  lines.push(`  upsert${singularPascal}BodySchema,`);
  lines.push(`  get${singularPascal}ParamsSchema,`);
  lines.push(`  delete${singularPascal}ParamsSchema,`);
  lines.push(`} = require(${jsString(validatorsRequirePath(meta))});`);
  lines.push("");
  lines.push(`const {`);
  lines.push(`  body,`);
  lines.push(`  query,`);
  lines.push(`  params,`);
  lines.push(`} = require(${jsString(configValidatorRequirePath(meta))});`);
  lines.push("");

  lines.push(`router.get(`);
  lines.push(`  ${jsString(meta.route)},`);
  lines.push(`  query(search${pluralPascal}QuerySchema),`);
  lines.push(`  // authorization(${jsString(meta.resource)}, "canSearch"),`);
  lines.push(`  async (req, res) => {`);
  lines.push(`    const filter = {`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(...routeFieldFilters(meta));
  lines.push(`    };`);
  lines.push("");
  lines.push(`    const skip = (req.query.page - 1) * req.query.perPage;`);
  lines.push(`    const limit = req.query.perPage;`);
  lines.push("");
  lines.push(`    const [items, totalItems] = await Promise.all([`);
  lines.push(`      ${meta.schemaExportName}.find(filter)`);
  lines.push(...populateLines(meta, metas, "        "));
  lines.push(`        .sort({ createdAt: -1 })`);
  lines.push(`        .skip(skip)`);
  lines.push(`        .limit(limit)`);
  lines.push(`        .lean(),`);
  lines.push("");
  lines.push(`      ${meta.schemaExportName}.countDocuments(filter),`);
  lines.push(`    ]);`);
  lines.push("");
  lines.push(`    const totalPages = Math.ceil(totalItems / limit);`);
  lines.push(`    const page = Math.floor(skip / limit) + 1;`);
  lines.push("");
  lines.push(`    return res.status(200).json({`);
  lines.push(`      data: items.map((record) => ({`);
  lines.push(`        id: String(record._id),`);
  lines.push(...listMapLines(meta, metas));
  lines.push(`      })),`);
  lines.push(`      pagination: {`);
  lines.push(`        page,`);
  lines.push(`        perPage: limit,`);
  lines.push(`        totalPages,`);
  lines.push(`        totalItems,`);
  lines.push(`        hasNextPage: page < totalPages,`);
  lines.push(`        hasPrevPage: page > 1,`);
  lines.push(`      },`);
  lines.push(`    });`);
  lines.push(`  },`);
  lines.push(`);`);
  lines.push("");

  lines.push(`router.post(`);
  lines.push(`  ${jsString(meta.route)},`);
  lines.push(`  body(upsert${singularPascal}BodySchema),`);
  lines.push(`  // (req, res, next) =>`);
  lines.push(
    `    // authorization(${jsString(meta.resource)}, req.body.id ? "canUpdate" : "canCreate")(`,
  );
  lines.push(`      // req,`);
  lines.push(`      // res,`);
  lines.push(`      // next,`);
  lines.push(`    // ),`);
  lines.push(`  async (req, res) => {`);
  lines.push(`    if (req.body.id) {`);
  lines.push(
    `      const oldRecord = await ${meta.schemaExportName}.findOne({`,
  );
  lines.push(`        _id: req.body.id,`);
  lines.push(`        // company: req.identity.company.id,`);
  lines.push(`      });`);
  lines.push("");
  lines.push(`      if (!oldRecord) {`);
  lines.push(`        return res.status(404).json({`);
  lines.push(`          message: ${jsString(messages.notFound)},`);
  lines.push(`        });`);
  lines.push(`      }`);
  lines.push("");
  lines.push(
    `      if (oldRecord?.status && ${blocked}.includes(oldRecord.status)) {`,
  );
  lines.push(`        return res.status(409).json({`);
  lines.push(`          message: ${jsString(messages.blocked)},`);
  lines.push(`        });`);
  lines.push(`      }`);
  lines.push("");
  lines.push(`      await ${meta.schemaExportName}.findOneAndUpdate(`);
  lines.push(`        {`);
  lines.push(`          _id: req.body.id,`);
  lines.push(`          // company: req.identity.company.id,`);
  lines.push(`        },`);
  lines.push(`        {`);
  lines.push(`          $set: req.body,`);
  lines.push(`        },`);
  lines.push(`        {`);
  lines.push(`          new: true,`);
  lines.push(`          runValidators: true,`);
  lines.push(`        },`);
  lines.push(`      );`);
  lines.push("");
  lines.push(`      return res.status(200).json({`);
  lines.push(`        message: ${jsString(messages.updated)},`);
  lines.push(`      });`);
  lines.push(`    }`);
  lines.push("");
  lines.push(`    const record = await ${meta.schemaExportName}.create({`);
  lines.push(`      ...req.body,`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(`    });`);
  lines.push("");
  lines.push(`    // await usage({`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(`      // subscription: req.identity.subscription.id,`);
  lines.push(`      // key: ${jsString(meta.resource)},`);
  lines.push(`    // });`);
  lines.push("");
  lines.push(`    return res.status(200).json({`);
  lines.push(`      id: String(record._id),`);
  lines.push(`      message: ${jsString(messages.created)},`);
  lines.push(`    });`);
  lines.push(`  },`);
  lines.push(`);`);
  lines.push("");

  lines.push(`router.get(`);
  lines.push(`  ${jsString(`${meta.route}/:id`)},`);
  lines.push(`  params(get${singularPascal}ParamsSchema),`);
  lines.push(`  // authorization(${jsString(meta.resource)}, "canRead"),`);
  lines.push(`  async (req, res) => {`);
  lines.push(`    const record = await ${meta.schemaExportName}.findOne({`);
  lines.push(`      _id: req.params.id,`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(`    })`);
  lines.push(...populateLines(meta, metas, "      "));
  lines.push(`      .lean();`);
  lines.push("");
  lines.push(`    if (!record) {`);
  lines.push(`      return res.status(404).json({`);
  lines.push(`        message: ${jsString(messages.notFound)},`);
  lines.push(`      });`);
  lines.push(`    }`);
  lines.push("");
  lines.push(`    return res.status(200).json({`);
  lines.push(`      id: String(record._id),`);
  lines.push(...detailMapLines(meta, metas));
  lines.push(`    });`);
  lines.push(`  },`);
  lines.push(`);`);
  lines.push("");

  lines.push(`router.delete(`);
  lines.push(`  ${jsString(`${meta.route}/:id`)},`);
  lines.push(`  params(delete${singularPascal}ParamsSchema),`);
  lines.push(`  // authorization(${jsString(meta.resource)}, "canDelete"),`);
  lines.push(`  async (req, res) => {`);
  lines.push(`    const record = await ${meta.schemaExportName}.findOne({`);
  lines.push(`      _id: req.params.id,`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(`    });`);
  lines.push("");
  lines.push(`    if (!record) {`);
  lines.push(`      return res.status(404).json({`);
  lines.push(`        message: ${jsString(messages.notFound)},`);
  lines.push(`      });`);
  lines.push(`    }`);
  lines.push("");
  lines.push(`    if (record?.status && ${blocked}.includes(record.status)) {`);
  lines.push(`      return res.status(409).json({`);
  lines.push(`        message: ${jsString(messages.blocked)},`);
  lines.push(`      });`);
  lines.push(`    }`);
  lines.push("");
  lines.push(`    await canDelete({`);
  lines.push(`      Model: null,`);
  lines.push(`      key: ${jsString(meta.resource)},`);
  lines.push(`      value: req.params.id,`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(`    });`);
  lines.push("");
  lines.push(`    await ${meta.schemaExportName}.deleteOne({`);
  lines.push(`      _id: req.params.id,`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(`    });`);
  lines.push("");
  lines.push(`    // await usage({`);
  lines.push(`      // company: req.identity.company.id,`);
  lines.push(`      // subscription: req.identity.subscription.id,`);
  lines.push(`      // key: ${jsString(meta.resource)},`);
  lines.push(`      // action: "remove",`);
  lines.push(`      // value: 1,`);
  lines.push(`    // });`);
  lines.push("");
  lines.push(`    return res.status(200).json({`);
  lines.push(`      message: ${jsString(messages.deleted)},`);
  lines.push(`    });`);
  lines.push(`  },`);
  lines.push(`);`);
  lines.push("");
  lines.push(`module.exports = router;`);
  lines.push("");

  fs.writeFileSync(meta.routerPath, lines.join("\n"), "utf8");
}

/*
────────────────────────────────────────────────────────────
REGION: frontend generation
────────────────────────────────────────────────────────────
*/
function frontendValidatorsPath(webAppDir) {
  return path.join(webAppDir, "validators.ts");
}

function frontendConfigValidatorPath(webAppDir) {
  return path.join(path.dirname(webAppDir), "core", "validator.ts");
}

function frontendCoreTypesPath(webAppDir) {
  return path.join(path.dirname(webAppDir), "core", "types.ts");
}

function frontendFetchPath(webAppDir) {
  return path.join(path.dirname(webAppDir), "core", "config", "fetch.ts");
}

function frontendFolderName(meta) {
  return kebabToRoute(meta.collection);
}

function frontendPagePath(webAppDir, meta) {
  const folder = frontendFolderName(meta);
  return path.join(webAppDir, folder, `${folder}.tsx`);
}

function pushFrontendValidationSchemas(lines, meta) {
  const names = validationExportNames(meta);

  lines.push(`export const ${names.search} = z.object({`);
  lines.push(...queryFieldLines(meta));
  lines.push(`});`);
  lines.push("");
  lines.push(`export const ${names.upsert} = z.object({`);
  lines.push(...bodyFieldLines(meta));
  lines.push(`});`);
  lines.push("");
  lines.push(`export const ${names.get} = idParamsSchema;`);
  lines.push("");
  lines.push(`export const ${names.remove} = idParamsSchema;`);
  lines.push("");
}

function generateFrontendValidatorsIndex(webAppDir, metas) {
  const outputPath = frontendValidatorsPath(webAppDir);
  const lines = [];

  lines.push(`import { z } from "zod";`);
  lines.push(`import { validatorMessages } from "../core/validator";`);
  lines.push("");
  lines.push(`export const objectIdSchema = z`);
  lines.push(`  .string({ message: validatorMessages.required })`);
  lines.push(`  .regex(/^[0-9a-fA-F]{24}$/, validatorMessages.objectId);`);
  lines.push("");
  lines.push(`export const booleanQuerySchema = z`);
  lines.push(
    `  .enum(["true", "false"], { message: validatorMessages.invalidValue })`,
  );
  lines.push(`  .transform((value) => value === "true");`);
  lines.push("");
  lines.push(`export const dateRangeQuerySchema = z.object({`);
  lines.push(
    `  from: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),`,
  );
  lines.push(
    `  to: z.string({ message: validatorMessages.invalidType }).datetime({ message: validatorMessages.invalidDate }).optional(),`,
  );
  lines.push(`});`);
  lines.push("");
  lines.push(`export const idParamsSchema = z.object({`);
  lines.push(`  id: objectIdSchema,`);
  lines.push(`});`);
  lines.push("");

  for (const meta of metas) pushFrontendValidationSchemas(lines, meta);

  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
  return outputPath;
}

function generateFrontendValidatorConfig(webAppDir) {
  const outputPath = frontendConfigValidatorPath(webAppDir);
  ensureDir(path.dirname(outputPath));

  const lines = [];
  lines.push(`export const validatorMessages = {`);
  lines.push(`  required: "Campo obligatorio",`);
  lines.push(`  objectId: "El identificador no es válido.",`);
  lines.push(`  invalidType: "Tipo de dato inválido",`);
  lines.push(`  tooSmall: "El valor es demasiado pequeño",`);
  lines.push(`  tooBig: "El valor es demasiado grande",`);
  lines.push(`  invalidString: "Formato de texto inválido",`);
  lines.push(`  invalidFormat: "Formato inválido",`);
  lines.push(`  invalidEnumValue: "Valor no permitido",`);
  lines.push(`  invalidValue: "Valor no permitido",`);
  lines.push(`  invalidLiteral: "Valor no permitido",`);
  lines.push(`  unrecognizedKeys: "Campos no permitidos",`);
  lines.push(`  invalidUnion: "No coincide con ningún formato permitido",`);
  lines.push(`  invalidDate: "Fecha inválida",`);
  lines.push(`  notFinite: "El número no es válido",`);
  lines.push(
    `  notMultipleOf: "El número no cumple con el múltiplo requerido",`,
  );
  lines.push(`  integer: "El número debe ser entero",`);
  lines.push(`  notNegative: "El valor no puede ser negativo",`);
  lines.push(`  custom: "No cumple con la validación requerida",`);
  lines.push(`  validationError: "Error de validación",`);
  lines.push(`  unexpected: "Ocurrió un error inesperado.",`);
  lines.push(
    `  min: (value: number) => \`El valor debe ser mayor o igual a \${value}\`,`,
  );
  lines.push(
    `  max: (value: number) => \`El valor debe ser menor o igual a \${value}\`,`,
  );
  lines.push(
    `  minLength: (value: number) => \`Debe tener al menos \${value} caracteres\`,`,
  );
  lines.push(
    `  maxLength: (value: number) => \`Debe tener como máximo \${value} caracteres\`,`,
  );
  lines.push(`} as const;`);
  lines.push("");

  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
  return outputPath;
}

function generateFrontendCoreTypes(webAppDir) {
  const outputPath = frontendCoreTypesPath(webAppDir);
  ensureDir(path.dirname(outputPath));

  const lines = [];
  lines.push(`export type Pagination = {`);
  lines.push(`  page: number;`);
  lines.push(`  perPage: number;`);
  lines.push(`  totalPages: number;`);
  lines.push(`  totalItems: number;`);
  lines.push(`  hasNextPage: boolean;`);
  lines.push(`  hasPrevPage: boolean;`);
  lines.push(`};`);
  lines.push("");
  lines.push(`export const initialPagination: Pagination = {`);
  lines.push(`  page: 1,`);
  lines.push(`  perPage: 10,`);
  lines.push(`  totalPages: 0,`);
  lines.push(`  totalItems: 0,`);
  lines.push(`  hasNextPage: false,`);
  lines.push(`  hasPrevPage: false,`);
  lines.push(`};`);
  lines.push("");

  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");
  return outputPath;
}

function ensureFrontendFetchApiMessage(webAppDir) {
  const outputPath = frontendFetchPath(webAppDir);
  if (!exists(outputPath)) return null;

  const current = fs.readFileSync(outputPath, "utf8");
  if (
    /export\s+type\s+ApiMessage\b/.test(current) ||
    /export\s+interface\s+ApiMessage\b/.test(current)
  ) {
    return null;
  }

  const apiMessage = `export interface ApiMessage {\n  id?: string;\n  message: string;\n}\n\n`;
  let updated = current;

  if (/type\s+ResponseType\s*=/.test(updated)) {
    updated = updated.replace(
      /type\s+ResponseType\s*=/,
      `${apiMessage}type ResponseType =`,
    );
  } else {
    updated = `${apiMessage}${updated}`;
  }

  fs.writeFileSync(outputPath, updated, "utf8");
  return outputPath;
}

function tsLiteralUnion(values) {
  return values.map((value) => JSON.stringify(String(value))).join(" | ");
}

function tsTypeForMapValue(value, metas, depth) {
  const descriptor = value || { type: "mixed" };

  if (descriptor.type === "array") {
    return `${tsTypeForArrayItem(descriptor.item || { type: "mixed" }, metas, depth)}[]`;
  }

  if (descriptor.type === "object") {
    return tsTypeForObjectFields(descriptor.fields || [], metas, depth);
  }

  return tsTypeForDescriptor(descriptor, metas, depth);
}

function tsTypeForArrayItem(item, metas, depth) {
  return tsTypeForDescriptor(item || { type: "mixed" }, metas, depth);
}

function tsTypeForObjectFields(fields, metas, depth) {
  const allowed = (fields || []).filter(
    (field) => !["company", "createdAt", "updatedAt"].includes(field.name),
  );

  if (!allowed.length || depth <= 0) return "Record<string, unknown>";

  return `{ ${allowed
    .map(
      (field) => `${field.name}?: ${tsTypeForField(field, metas, depth - 1)}`,
    )
    .join("; ")} }`;
}

function tsTypeForDescriptor(descriptor, metas, depth) {
  if (descriptor.enum?.length) return tsLiteralUnion(descriptor.enum);
  if (descriptor.ref) return "string | { id: string; [key: string]: unknown }";

  if (descriptor.type === "array") {
    return `${tsTypeForArrayItem(descriptor.item || { type: "mixed" }, metas, depth)}[]`;
  }

  if (descriptor.type === "object") {
    return tsTypeForObjectFields(descriptor.fields || [], metas, depth);
  }

  if (descriptor.type === "objectId") return "string";
  if (descriptor.type === "number") return "number";
  if (descriptor.type === "boolean") return "boolean";
  if (descriptor.type === "date") return "string";
  if (descriptor.type === "map") {
    return `Record<string, ${tsTypeForMapValue(descriptor.mapOf, metas, depth - 1)}>`;
  }
  if (descriptor.type === "string") return "string";

  return "unknown";
}

function tsTypeForField(field, metas, depth = 2) {
  if (field.array) return `${tsTypeForArrayItem(field.item, metas, depth)}[]`;
  if (field.object)
    return tsTypeForObjectFields(field.fields || [], metas, depth);
  return tsTypeForDescriptor(field, metas, depth);
}

function frontendSearchItemLines(meta, metas) {
  const lines = [`  id: string;`];

  for (const field of meta.fields) {
    if (["company", "createdAt", "updatedAt"].includes(field.name)) continue;
    lines.push(`  ${field.name}?: ${tsTypeForField(field, metas)};`);
  }

  lines.push(`  created?: string;`);
  lines.push(`  updated?: string;`);
  return lines;
}

function frontendFormFields(meta) {
  return meta.fields.filter((field) => {
    if (["company", "createdAt", "updatedAt"].includes(field.name))
      return false;
    if (
      field.array ||
      field.object ||
      field.type === "mixed" ||
      field.type === "map"
    ) {
      return false;
    }
    return true;
  });
}

function frontendDateQueryFields(meta) {
  return meta.fields.filter((field) => {
    if (["company", "createdAt", "updatedAt"].includes(field.name))
      return false;
    if (
      field.array ||
      field.object ||
      field.type === "mixed" ||
      field.type === "map"
    )
      return false;
    return field.type === "date";
  });
}

function frontendFormInputType(field) {
  if (field.type === "number") return "number";
  return "text";
}

function pushFrontendFieldControl(lines, field, indent = "        ") {
  const name = field.name;

  if (field.type === "boolean") {
    lines.push(`${indent}<label>`);
    lines.push(
      `${indent}  <input type="checkbox" {...form.register(${jsString(name)})} />`,
    );
    lines.push(`${indent}  ${name}`);
    lines.push(`${indent}</label>`);
    return;
  }

  lines.push(`${indent}<label>`);
  lines.push(`${indent}  <span>${name}</span>`);

  if (field.enum?.length) {
    lines.push(`${indent}  <select {...form.register(${jsString(name)})}>`);
    lines.push(`${indent}    <option value="">Seleccione</option>`);
    for (const value of field.enum) {
      lines.push(
        `${indent}    <option value=${jsString(String(value))}>${String(value)}</option>`,
      );
    }
    lines.push(`${indent}  </select>`);
  } else {
    const type = frontendFormInputType(field);
    lines.push(
      `${indent}  <input type=${jsString(type)} {...form.register(${jsString(name)})} />`,
    );
  }

  lines.push(`${indent}  {form.formState.errors.${name}?.message && (`);
  lines.push(
    `${indent}    <span>{String(form.formState.errors.${name}.message)}</span>`,
  );
  lines.push(`${indent}  )}`);
  lines.push(`${indent}</label>`);
}

function pushFrontendUpsertForm(lines, submitName, singularPascal) {
  lines.push(`    <form onSubmit={form.handleSubmit(${submitName})}>`);
  lines.push(`      <input type="hidden" {...form.register("id")} />`);
  lines.push(`      <button`);
  lines.push(`        type="submit"`);
  lines.push(
    `        disabled={!form.formState.isValid || form.formState.isSubmitting}`,
  );
  lines.push(`      >`);
  lines.push(`        Guardar ${singularPascal}`);
  lines.push(`      </button>`);
  lines.push(`    </form>`);
}

function pushFrontendDeleteForm(lines, submitName, singularPascal) {
  lines.push(
    `    <form onSubmit={form.handleSubmit((body) => ${submitName}(body.id))}>`,
  );
  lines.push(`      <input type="hidden" {...form.register("id")} />`);
  lines.push(`      <button`);
  lines.push(`        type="submit"`);
  lines.push(
    `        disabled={!form.formState.isValid || form.formState.isSubmitting}`,
  );
  lines.push(`      >`);
  lines.push(`        Eliminar ${singularPascal}`);
  lines.push(`      </button>`);
  lines.push(`    </form>`);
}

function frontendScalarQueryFields(meta) {
  return meta.fields.filter((field) => {
    if (["company", "createdAt", "updatedAt"].includes(field.name))
      return false;
    if (
      field.array ||
      field.object ||
      field.type === "mixed" ||
      field.type === "map" ||
      field.type === "date"
    )
      return false;
    return true;
  });
}

function pushFrontendSearchRequest(
  lines,
  meta,
  schemaName,
  requestName,
  route,
) {
  const dateFields = frontendDateQueryFields(meta);
  const scalarFields = frontendScalarQueryFields(meta);

  lines.push(`  const search${pascalCase(meta.collection)} = (`);
  lines.push(
    `    query: z.output<typeof ${schemaName}> = { page: 1, perPage: 10 },`,
  );
  lines.push(`  ) =>`);
  lines.push(`    ${requestName}.request(`);
  lines.push(`      fetch.get(${jsString(route)}, {`);
  lines.push(`        query: {`);
  lines.push(`          page: query.page,`);
  lines.push(`          perPage: query.perPage,`);

  for (const field of scalarFields) {
    lines.push(`          ${field.name}: query.${field.name},`);
  }

  for (const field of dateFields) {
    lines.push(
      `          ...(query.${field.name}?.from && { ${jsString(`${field.name}[from]`)}: query.${field.name}.from }),`,
    );
    lines.push(
      `          ...(query.${field.name}?.to && { ${jsString(`${field.name}[to]`)}: query.${field.name}.to }),`,
    );
  }

  lines.push(`        },`);
  lines.push(`      }),`);
  lines.push(`    );`);
}

function generateFrontendPage(webAppDir, meta, metas) {
  const pluralPascal = pascalCase(meta.collection);
  const singularPascal = pascalCase(meta.modelName);
  const pluralCamel = camelCase(meta.collection);
  const singularCamel = camelCase(meta.modelName);
  const names = validationExportNames(meta);
  const pagePath = frontendPagePath(webAppDir, meta);
  const pageDir = path.dirname(pagePath);
  const searchItemType = `${singularPascal}SearchItem`;
  const searchResponseType = `Search${pluralPascal}Response`;
  const initialResponseName = `initial${pluralPascal}Response`;
  const upsertModalComponent = `Upsert${singularPascal}Modal`;
  const deleteModalComponent = `Delete${singularPascal}Modal`;
  const upsertModalDataType = `Upsert${singularPascal}ModalData`;
  const deleteModalDataType = `Delete${singularPascal}ModalData`;
  const searchFunctionName = `search${pluralPascal}`;
  const getFunctionName = `get${singularPascal}`;
  const upsertFunctionName = `upsert${singularPascal}`;
  const deleteFunctionName = `delete${singularPascal}`;

  ensureDir(pageDir);

  const lines = [];
  lines.push(`import { useEffect } from "react";`);
  lines.push(`import { useForm } from "react-hook-form";`);
  lines.push(`import { z } from "zod";`);
  lines.push(`import { zodResolver } from "@hookform/resolvers/zod";`);
  lines.push(
    `import { fetch, useRequest, type ApiMessage } from "../../core/config/fetch";`,
  );
  lines.push(
    `import { initialPagination, type Pagination } from "../../core/types";`,
  );
  lines.push(`import {`);
  lines.push(`  useComponent,`);
  lines.push(`  type RegisteredComponentProps,`);
  lines.push(`} from "../../core/context/component";`);
  lines.push(`import {`);
  lines.push(`  ${names.search},`);
  lines.push(`  ${names.upsert},`);
  lines.push(`  ${names.get},`);
  lines.push(`  ${names.remove},`);
  lines.push(`} from "../validators";`);
  lines.push("");
  lines.push(`type ${searchItemType} = {`);
  lines.push(...frontendSearchItemLines(meta, metas));
  lines.push(`};`);
  lines.push("");
  lines.push(`type ${searchResponseType} = {`);
  lines.push(`  data: ${searchItemType}[];`);
  lines.push(`  pagination: Pagination;`);
  lines.push(`};`);
  lines.push("");
  lines.push(`type ${upsertModalDataType} = {`);
  lines.push(`  id?: z.infer<typeof ${names.get}>["id"];`);
  lines.push(`};`);
  lines.push("");
  lines.push(`type ${deleteModalDataType} = {`);
  lines.push(`  id?: z.infer<typeof ${names.remove}>["id"];`);
  lines.push(`};`);
  lines.push("");
  lines.push(`const ${initialResponseName}: ${searchResponseType} = {`);
  lines.push(`  data: [],`);
  lines.push(`  pagination: initialPagination,`);
  lines.push(`};`);
  lines.push("");
  lines.push(`export function ${pluralPascal}() {`);
  lines.push(`  const { registerComponent, openComponent } = useComponent();`);
  lines.push(
    `  const ${pluralCamel}Request = useRequest<${searchResponseType}>(${initialResponseName});`,
  );
  lines.push("");
  pushFrontendSearchRequest(
    lines,
    meta,
    names.search,
    `${pluralCamel}Request`,
    meta.route,
  );
  lines.push("");
  lines.push(`  useEffect(() => {`);
  lines.push(
    `    registerComponent("upsert${singularPascal}", ${upsertModalComponent});`,
  );
  lines.push(
    `    registerComponent("delete${singularPascal}", ${deleteModalComponent});`,
  );
  lines.push(`    void ${searchFunctionName}();`);
  lines.push(`  }, []);`);
  lines.push("");
  lines.push(`  return (`);
  lines.push(`    <div>`);
  lines.push(`      <button`);
  lines.push(`        type="button"`);
  lines.push(
    `        onClick={() => openComponent("upsert${singularPascal}")}`,
  );
  lines.push(`      >`);
  lines.push(`        Nuevo ${singularPascal}`);
  lines.push(`      </button>`);
  lines.push(
    `      <pre>{JSON.stringify(${pluralCamel}Request.data, null, 2)}</pre>`,
  );
  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push("");
  lines.push(`export function ${upsertModalComponent}({`);
  lines.push(`  data,`);
  lines.push(`}: RegisteredComponentProps<${upsertModalDataType}>) {`);
  lines.push(
    `  const get${singularPascal}Request = useRequest<z.output<typeof ${names.upsert}> | null>(null);`,
  );
  lines.push(
    `  const upsert${singularPascal}Request = useRequest<ApiMessage | null>(null);`,
  );
  lines.push(`  const form = useForm<`);
  lines.push(`    z.input<typeof ${names.upsert}>,`);
  lines.push(`    unknown,`);
  lines.push(`    z.output<typeof ${names.upsert}>`);
  lines.push(`  >({`);
  lines.push(`    resolver: zodResolver(${names.upsert}),`);
  lines.push(`    mode: "onChange",`);
  lines.push(`    defaultValues: {`);
  lines.push(`      id: data?.id,`);
  lines.push(`    },`);
  lines.push(`  });`);
  lines.push("");
  lines.push(
    `  const ${getFunctionName} = (id: z.infer<typeof ${names.get}>["id"]) =>`,
  );
  lines.push(
    `    get${singularPascal}Request.request(fetch.get(\`${meta.route}/\${id}\`));`,
  );
  lines.push("");
  lines.push(
    `  const ${upsertFunctionName} = (body: z.output<typeof ${names.upsert}>) =>`,
  );
  lines.push(
    `    upsert${singularPascal}Request.request(fetch.post(${jsString(meta.route)}, body));`,
  );
  lines.push("");
  lines.push(`  useEffect(() => {`);
  lines.push(`    if (!data?.id) return;`);
  lines.push(`    void ${getFunctionName}(data.id);`);
  lines.push(`  }, [data?.id]);`);
  lines.push("");
  lines.push(`  useEffect(() => {`);
  lines.push(`    if (!get${singularPascal}Request.data) return;`);
  lines.push(`    form.reset(get${singularPascal}Request.data);`);
  lines.push(`  }, [get${singularPascal}Request.data, form]);`);
  lines.push("");
  lines.push(`  return (`);
  lines.push(`    <div>`);
  pushFrontendUpsertForm(lines, upsertFunctionName, singularPascal);
  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push("");
  lines.push(`export function ${deleteModalComponent}({`);
  lines.push(`  data,`);
  lines.push(`}: RegisteredComponentProps<${deleteModalDataType}>) {`);
  lines.push(
    `  const delete${singularPascal}Request = useRequest<ApiMessage | null>(null);`,
  );
  lines.push(`  const form = useForm<`);
  lines.push(`    z.input<typeof ${names.remove}>,`);
  lines.push(`    unknown,`);
  lines.push(`    z.output<typeof ${names.remove}>`);
  lines.push(`  >({`);
  lines.push(`    resolver: zodResolver(${names.remove}),`);
  lines.push(`    mode: "onChange",`);
  lines.push(`    defaultValues: {`);
  lines.push(`      id: data!.id,`);
  lines.push(`    },`);
  lines.push(`  });`);
  lines.push("");
  lines.push(
    `  const ${deleteFunctionName} = (id: z.infer<typeof ${names.remove}>["id"]) =>`,
  );
  lines.push(
    `    delete${singularPascal}Request.request(fetch.delete(\`${meta.route}/\${id}\`));`,
  );
  lines.push("");
  lines.push(`  return (`);
  lines.push(`    <div>`);
  pushFrontendDeleteForm(lines, deleteFunctionName, singularPascal);
  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push("");

  fs.writeFileSync(pagePath, lines.join("\n"), "utf8");
  return pagePath;
}

function generateFrontendPages(webAppDir, metas) {
  const touchedFiles = [];
  touchedFiles.push(generateFrontendValidatorsIndex(webAppDir, metas));
  touchedFiles.push(generateFrontendValidatorConfig(webAppDir));
  touchedFiles.push(generateFrontendCoreTypes(webAppDir));

  const fetchPath = ensureFrontendFetchApiMessage(webAppDir);
  if (fetchPath) touchedFiles.push(fetchPath);

  for (const meta of metas) {
    touchedFiles.push(generateFrontendPage(webAppDir, meta, metas));
  }

  return touchedFiles;
}

/*
────────────────────────────────────────────────────────────
REGION: help
────────────────────────────────────────────────────────────
*/
const HELP_ARGS = new Set(["help", "--help", "-h"]);
const SUPPORTED_MODES = new Set([
  "all",
  "schema",
  "schemas",
  "validator",
  "front",
]);

function isHelpArg(value) {
  return HELP_ARGS.has(String(value || "").toLowerCase());
}

function printHelp() {
  line();
  console.log("Generador de backend y front básico");
  line();
  console.log("Uso:");
  console.log("  node discovery.js <project> [mode]");
  console.log("");
  console.log("Argumentos:");
  console.log("  <project>       Nombre de la carpeta del proyecto.");
  console.log("  [mode]          Acción a ejecutar. Por defecto: all.");
  console.log("");
  console.log("Modos disponibles:");
  console.log(
    "  all             Genera schemas.js, validators.js, routers, validators.ts, core/validator.ts, core/types.ts y páginas del front.",
  );
  console.log("  schema          Genera solo schemas.js.");
  console.log("  schemas         Alias de schema.");
  console.log(
    "  validator       Genera solo validators.js centralizado del backend.",
  );
  console.log(
    "  front           Genera validators.ts, core/validator.ts, core/types.ts y páginas con modals registrados.",
  );
  console.log("  help            Muestra esta ayuda.");
  console.log("");
  console.log("Ejemplos:");
  console.log("  node discovery.js reservas");
  console.log("  node discovery.js reservas schemas");
  console.log("  node discovery.js reservas validator");
  console.log("  node discovery.js reservas front");
  console.log("  node discovery.js reservas help");
  line();
}

function isValidMode(mode) {
  return SUPPORTED_MODES.has(mode);
}

/*
────────────────────────────────────────────────────────────
REGION: main
────────────────────────────────────────────────────────────
*/
function main() {
  const requestedProject = process.argv[2];
  const mode = String(process.argv[3] || "all").toLowerCase();

  if (!requestedProject || isHelpArg(requestedProject) || isHelpArg(mode)) {
    printHelp();
    process.exit(requestedProject ? 0 : 1);
  }

  if (!isValidMode(mode)) {
    printHelp();
    error(`Modo no válido: ${mode}`);
    process.exit(1);
  }

  const onlySchemasIndex = ["schema", "schemas"].includes(mode);
  const onlyValidators = mode === "validator";
  const onlyFrontend = mode === "front";

  const { projectName, projectDir } = findProject(requestedProject);
  const serverDir = findServerDir(projectDir, projectName);
  const webDir = findWebDir(projectDir, projectName);
  const serverAppDir = path.join(serverDir, "src", "app");
  const webAppDir = path.join(webDir, "src", "app");

  ensureDir(serverAppDir);
  ensureDir(webAppDir);

  const schemaFiles = findSchemaFiles(serverAppDir);
  const metas = schemaFiles.map((filePath) =>
    schemaMeta(filePath, serverAppDir),
  );
  const touchedFiles = [];
  const removedFiles = [];
  const errors = [];

  if (!onlyValidators && !onlyFrontend) {
    touchedFiles.push(generateSchemasIndex(serverAppDir, metas));
  }

  if (onlyValidators) {
    try {
      touchedFiles.push(generateValidatorsIndex(serverAppDir, metas));
      removedFiles.push(...cleanupStaleValidators(serverAppDir, metas));
    } catch (exception) {
      errors.push({
        filePath: path.join(serverAppDir, "validators.js"),
        message: exception.message,
      });
    }
  }

  if (!onlySchemasIndex && !onlyValidators && !onlyFrontend) {
    for (const meta of metas) {
      try {
        consolidateSchema(meta);
      } catch (exception) {
        errors.push({ filePath: meta.filePath, message: exception.message });
      }
    }

    const refreshedSchemaFiles = findSchemaFiles(serverAppDir);
    const refreshedMetas = refreshedSchemaFiles.map((filePath) =>
      schemaMeta(filePath, serverAppDir),
    );

    try {
      touchedFiles.push(generateValidatorsIndex(serverAppDir, refreshedMetas));
      removedFiles.push(
        ...cleanupStaleValidators(serverAppDir, refreshedMetas),
      );
    } catch (exception) {
      errors.push({
        filePath: path.join(serverAppDir, "validators.js"),
        message: exception.message,
      });
    }

    for (const refreshed of refreshedMetas) {
      try {
        generateRouter(refreshed, refreshedMetas);

        touchedFiles.push(refreshed.filePath, refreshed.routerPath);
      } catch (exception) {
        errors.push({
          filePath: refreshed.filePath,
          message: exception.message,
        });
      }
    }
  }

  if (onlyFrontend || mode === "all") {
    const currentSchemaFiles = findSchemaFiles(serverAppDir);
    const currentMetas = currentSchemaFiles.map((filePath) =>
      schemaMeta(filePath, serverAppDir),
    );

    try {
      touchedFiles.push(...generateFrontendPages(webAppDir, currentMetas));
    } catch (exception) {
      errors.push({
        filePath: webAppDir,
        message: exception.message,
      });
    }
  }

  console.log("Files touched:");
  for (const filePath of [...new Set(touchedFiles)]) {
    console.log(`- ${normalizeSlash(path.relative(process.cwd(), filePath))}`);
  }

  if (removedFiles.length) {
    console.log("");
    console.log("Files removed:");
    for (const filePath of [...new Set(removedFiles)]) {
      console.log(
        `- ${normalizeSlash(path.relative(process.cwd(), filePath))}`,
      );
    }
  }

  if (errors.length) {
    console.log("");
    console.log("Files with errors:");
    for (const item of errors) {
      console.log(
        `- ${normalizeSlash(path.relative(process.cwd(), item.filePath))}: ${item.message}`,
      );
    }
  }

  console.log("🏁 Finished");
}

main();
