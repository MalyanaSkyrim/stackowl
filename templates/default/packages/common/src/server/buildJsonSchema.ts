import z from 'zod'

/**
 * Per-node override for `z.toJSONSchema()` that fixes incompatibilities between
 * OpenAPI 3.0 output and Fastify's AJV (draft-7).
 *
 * Called by Zod for **every** node in the schema tree — no recursion needed.
 *
 * Fixes:
 * 1. `exclusiveMinimum`/`exclusiveMaximum` boolean → number
 *    OpenAPI 3.0: `{ minimum: 0, exclusiveMinimum: true }`  →  AJV draft-7: `{ exclusiveMinimum: 0 }`
 *    @see https://ajv.js.org/json-schema.html — "NO support for boolean keyword values"
 *
 * 2. `nullable: true` without `type` → inline null into enum/oneOf/anyOf
 *    AJV requires `nullable` to be paired with `type`. For schemas expressed via
 *    `enum`, `oneOf`, or `anyOf` (no `type`), we remove `nullable` and add `null` directly.
 *
 * 3. `nullable: true` with `enum` → inline null into enum, drop `nullable` and `type`
 *    AJV's `nullable` does not extend `enum`: `{ type: 'string', enum: [...], nullable: true }`
 *    rejects null with an enum error, and keeping `type` rejects null with a type error.
 *    `{ enum: [...values, null] }` alone accepts exactly the declared values plus null.
 *
 * 4. `pattern` alongside a standard `format` → deleted
 *    Zod's internal patterns for formats (date, date-time, …) can be too restrictive
 *    (e.g. timezone offsets); AJV's built-in format validation takes over.
 *
 * 5. Missing `additionalProperties` on objects → restore strip semantics
 *    Zod v4 `z.object()` omits `additionalProperties` entirely, so Fastify's default
 *    `removeAdditional: true` no longer strips unknown keys: they reach handlers verbatim.
 *    Restore the pre-migration contract: objects with declared properties reject extra keys
 *    (`false` → AJV strips them), empty objects stay permissive (`true`).
 *    Explicit `additionalProperties` (z.strictObject, z.looseObject, z.record) is left untouched.
 *
 * 6. `oneOf` → `anyOf`
 *    Zod v4 emits `oneOf` for `z.discriminatedUnion` (zod 3.x emitted `anyOf`).
 *    AJV evaluates **every** `oneOf` branch to enforce exactly-one-match, so with
 *    `removeAdditional: true` a non-matching branch still strips the shared payload
 *    (e.g. the declined branch deletes `orderLive` before the accepted branch runs).
 *    `anyOf` short-circuits at the first matching branch, restoring pre-migration
 *    behavior. Discriminated-union branches are mutually exclusive by construction
 *    (literal discriminator), so exactly-one and at-least-one are equivalent here.
 *
 * @param jsonSchema The JSON schema node to fix (mutated in place)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyOpenApiToAjvOverrides = (
  jsonSchema: Record<string, any>,
): void => {
  // ── Fix 1: exclusive bounds ──
  if (
    jsonSchema.exclusiveMinimum === true &&
    typeof jsonSchema.minimum === 'number'
  ) {
    jsonSchema.exclusiveMinimum = jsonSchema.minimum
    delete jsonSchema.minimum
  } else if (jsonSchema.exclusiveMinimum === false) {
    delete jsonSchema.exclusiveMinimum
  }

  if (
    jsonSchema.exclusiveMaximum === true &&
    typeof jsonSchema.maximum === 'number'
  ) {
    jsonSchema.exclusiveMaximum = jsonSchema.maximum
    delete jsonSchema.maximum
  } else if (jsonSchema.exclusiveMaximum === false) {
    delete jsonSchema.exclusiveMaximum
  }

  // ── Fix 2: nullable without type ──
  if (jsonSchema.nullable === true && !('type' in jsonSchema)) {
    delete jsonSchema.nullable

    if (Array.isArray(jsonSchema.enum)) {
      if (!jsonSchema.enum.includes(null)) jsonSchema.enum.push(null)
    } else if (Array.isArray(jsonSchema.oneOf)) {
      jsonSchema.oneOf.push({ type: 'null' })
    } else if (Array.isArray(jsonSchema.anyOf)) {
      jsonSchema.anyOf.push({ type: 'null' })
    } else if ('const' in jsonSchema) {
      jsonSchema.enum = [jsonSchema.const, null]
      delete jsonSchema.const
    }
  }

  // ── Fix 3: nullable enum with type ──
  if (
    jsonSchema.nullable === true &&
    'type' in jsonSchema &&
    Array.isArray(jsonSchema.enum)
  ) {
    delete jsonSchema.nullable
    delete jsonSchema.type
    if (!jsonSchema.enum.includes(null)) jsonSchema.enum.push(null)
  }

  // ── Fix 4: remove pattern when standard format is specified ──
  // Zod's internal patterns for formats (like date, date-time) can be too restrictive (e.g., timezone offsets).
  // Deleting the pattern allows AJV to validate using its built-in standard format validations.
  if (jsonSchema.format && 'pattern' in jsonSchema) {
    delete jsonSchema.pattern
  }

  // ── Fix 5: restore additionalProperties strip semantics ──
  if (jsonSchema.type === 'object' && !('additionalProperties' in jsonSchema)) {
    const hasProperties =
      jsonSchema.properties && Object.keys(jsonSchema.properties).length > 0
    jsonSchema.additionalProperties = !hasProperties
  }

  // ── Fix 6: oneOf → anyOf ──
  if (Array.isArray(jsonSchema.oneOf)) {
    jsonSchema.anyOf = jsonSchema.oneOf
    delete jsonSchema.oneOf
  }
}

type SchemaKey<M extends Models> =
  M extends Models<infer Key> ? Key & string : never
type SchemaKeyOrDescription<M extends Models> =
  | SchemaKey<M>
  | {
      readonly description: string
      readonly key: SchemaKey<M>
    }

type $Ref<M extends Models> = (key: SchemaKeyOrDescription<M>) => {
  readonly $ref: string
  readonly description?: string
}

export type JsonSchema = {
  readonly $id: string
  [key: string]: unknown
}

type Models<Key extends string = string> = {
  readonly [K in Key]: z.ZodType<unknown>
}

export type BuildJsonSchemasResult<M extends Models> = {
  readonly schemas: JsonSchema[]
  readonly $ref: $Ref<M>
}

export interface BuildJsonSchemasOptions {
  $id?: string
  target?: string
}

export const findInvalidSchemas = (
  schema: z.ZodType | z.core.$ZodType,
  map: Record<string, 'invalid'> = {},
  path: string = 'root',
  visited = new Set<z.ZodType | z.core.$ZodType>(),
): Record<string, 'invalid'> => {
  if (visited.has(schema)) {
    return map
  }
  visited.add(schema)

  if (
    schema instanceof z.ZodTransform ||
    schema instanceof z.ZodDate ||
    schema instanceof z.ZodBigInt ||
    schema instanceof z.ZodBigIntFormat ||
    schema instanceof z.ZodSymbol ||
    schema instanceof z.ZodVoid ||
    schema instanceof z.ZodMap ||
    schema instanceof z.ZodNaN ||
    schema instanceof z.ZodCustom
  ) {
    return {
      ...map,
      [path]: 'invalid',
    }
  }

  if (schema instanceof z.ZodObject) {
    return Object.entries(schema.shape).reduce((prev, [key, value]) => {
      return findInvalidSchemas(value, prev, `${path}.${key}`, visited)
    }, map)
  }

  if (schema instanceof z.ZodUnion) {
    return schema.def.options.reduce((prev, option) => {
      return findInvalidSchemas(option, prev, path, visited)
    }, map)
  }

  if (schema instanceof z.ZodIntersection) {
    return {
      ...findInvalidSchemas(schema.def.left, map, path, visited),
      ...findInvalidSchemas(schema.def.right, map, path, visited),
    }
  }

  if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodDefault
  ) {
    return findInvalidSchemas(schema.def.innerType, map, path, visited)
  }

  if (schema instanceof z.ZodArray) {
    return findInvalidSchemas(schema.element, map, path, visited)
  }

  if (schema instanceof z.ZodRecord) {
    return findInvalidSchemas(schema.valueType, map, path, visited)
  }

  if (schema instanceof z.ZodPipe) {
    return {
      ...findInvalidSchemas(schema.def.in, map, path, visited),
      ...findInvalidSchemas(schema.def.out, map, path, visited),
    }
  }

  if (schema instanceof z.ZodLazy) {
    return findInvalidSchemas(schema._zod.def.getter(), map, path, visited)
  }

  return map
}

export const buildJsonSchemas = <M extends Models>(
  models: M,
  opts: BuildJsonSchemasOptions = {},
): BuildJsonSchemasResult<M> => {
  const $id = opts.$id ?? 'Schema'

  const zodSchema = z.object(models)

  const invalidSchemas = findInvalidSchemas(zodSchema, {}, opts.$id)

  const invalidSchemasList = Object.entries(invalidSchemas).filter(
    ([, value]) => value === 'invalid',
  )

  if (invalidSchemasList.length > 0)
    console.warn(
      `⚠️ Found unsupported schemas: `,
      invalidSchemasList.map(([key]) => key),
    )

  /**
   * Ajv does not support json schema draft-2020-12
   * @see https://github.com/fastify/fastify/issues/5448
   */
  const zodJsonSchema = z.toJSONSchema(zodSchema, {
    target: 'openapi-3.0',
    io: 'input',
    unrepresentable: 'any',
    override: ({ jsonSchema }) => {
      applyOpenApiToAjvOverrides(jsonSchema)
    },
  })

  const jsonSchema = {
    ...zodJsonSchema,
    $id,
  }

  const $ref: $Ref<M> = (key) => {
    const isKeyObject = typeof key === 'object' && key !== null && 'key' in key
    const refKey = isKeyObject ? key.key : key

    const $ref = `${$id}#/properties/${refKey}`

    return isKeyObject ? { $ref, description: key.description } : { $ref }
  }

  return {
    schemas: [jsonSchema],
    $ref,
  }
}

export const withRefResolver = <T extends Record<string, any>>(
  options: T,
): T => {
  return {
    ...options,
    refResolver: {
      buildLocalReference(
        jsonSchema: any,
        _schemaOptions: any,
        sharedSchemaId: string,
      ) {
        return jsonSchema.$id || sharedSchemaId
      },
    },
  }
}
