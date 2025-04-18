type PayloadWithCustomFields = { custom_fields?: { [k: string]: unknown } }

export function addCustomFieldsFromPayloadToEntity<E extends object>(payload: PayloadWithCustomFields, entity: E) {
  if (!payload.custom_fields) {
    return
  }
  Object.assign(entity, payload.custom_fields)
}
