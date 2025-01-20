import { InputField } from '@segment/actions-core'
import { MAX_BATCH_SIZE } from '../constants'

export const fields: Record<string, InputField> = {
  segment_computation_action: {
    label: 'Segment Computation Class',
    description:
      "Segment computation class used to determine if input event is from an Engage Audience'. Value must be = 'audience'.",
    type: 'string',
    unsafe_hidden: true,
    required: true,
    default: {
      '@path': '$.context.personas.computation_class'
    },
    choices: [{ label: 'audience', value: 'audience' }]
  },
  external_audience_id: {
    type: 'string',
    label: 'Audience ID',
    description: 'Unique Audience Identifier returned by the createAudience() function call.',
    required: true,
    unsafe_hidden: true,
    default: {
      '@path': '$.context.personas.external_audience_id'
    }
  },
  segment_audience_key: {
    label: 'Audience Key',
    description: 'Segment Audience key',
    type: 'string',
    unsafe_hidden: true,
    required: true,
    default: {
      '@path': '$.context.personas.computation_key'
    }
  },
  traits_or_props: {
    label: 'Traits or properties object',
    description: 'A computed object for track and identify events. This field should not need to be edited.',
    type: 'object',
    required: true,
    unsafe_hidden: true,
    default: {
      '@if': {
        exists: { '@path': '$.properties' },
        then: { '@path': '$.properties' },
        else: { '@path': '$.traits' }
      }
    }
  },
  identifiers: {
    label: 'Contact Identifiers',
    description: `Identifiers for the Contact. At least one identifier must be provided.`,
    type: 'object',
    required: true,
    defaultObjectUI: 'keyvalue:only',
    additionalProperties: false,
    properties: {
      email: {
        label: 'Email Address',
        description: `The contact's email address.`,
        type: 'string',
        format: 'email',
        required: false
      },
      anonymous_id: {
        label: 'Anonymous ID',
        description: `The contact's anonymous ID.`,
        type: 'string',
        required: false
      },
      external_id: {
        label: 'External ID',
        description: `The contact's external ID.`,
        type: 'string',
        required: false
      },
      phone_number_id: {
        label: 'Phone Number ID',
        description: `A Contact identifier in the form of a phone number in E.164 format.`,
        type: 'string',
        required: false
      }
    },
    default: {
      email: {
        '@if': {
          exists: { '@path': '$.traits.email' },
          then: { '@path': '$.traits.email' },
          else: { '@path': '$.context.traits.email' }
        }
      }
    }
  },
  user_attributes: {
    label: 'User Attributes',
    description: `Additional user attributes to be included in the request.`,
    type: 'object',
    required: false,
    defaultObjectUI: 'keyvalue',
    additionalProperties: false,
    properties: {
      first_name: {
        label: 'First Name',
        description: `The contact's first name.`,
        type: 'string'
      },
      last_name: {
        label: 'Last Name',
        description: `The contact's last name.`,
        type: 'string'
      },
      phone_number: {
        label: 'Phone Number',
        description: `The contact's phone number in E.164 format. This phone number is not treated as a Contact identifer (as the Phone Number ID is).`,
        type: 'string'
      },
      address_line_1: {
        label: 'Address Line 1',
        description: `The contact's address line 1.`,
        type: 'string'
      },
      address_line_2: {
        label: 'Address Line 2',
        description: `The contact's address line 2.`,
        type: 'string'
      },
      city: {
        label: 'City',
        description: `The contact's city.`,
        type: 'string'
      },
      state_province_region: {  
        label: 'State/Province/Region',
        description: `The contact's state, province, or region.`,
        type: 'string'
      },
      country: {
        label: 'Country',
        description: `The contact's country.`,
        type: 'string'
      },
      postal_code: {
        label: 'Postal Code',
        description: `The contact's postal code.`,
        type: 'string'
      }
    },
    default: {
      first_name: {       
        '@if': {
          exists: { '@path': '$.traits.first_name' },
          then: { '@path': '$.traits.first_name' },
          else: { '@path': '$.properties.first_name' }
        } 
      },
      last_name: {       
        '@if': {
          exists: { '@path': '$.traits.last_name' },
          then: { '@path': '$.traits.last_name' },
          else: { '@path': '$.properties.last_name' }
        } 
      },
      phone_number: {       
        '@if': {
          exists: { '@path': '$.traits.phone' },
          then: { '@path': '$.traits.phone' },
          else: { '@path': '$.properties.phone' }
        } 
      },
      address_line_1: {       
        '@if': {
          exists: { '@path': '$.traits.street' },
          then: { '@path': '$.traits.street' },
          else: { '@path': '$.properties.street' }
        } 
      },
      address_line_2: {       
        '@if': {
          exists: { '@path': '$.traits.address_line_2' },
          then: { '@path': '$.traits.address_line_2' },
          else: { '@path': '$.properties.address_line_2' }
        } 
      },
      city: {       
        '@if': {
          exists: { '@path': '$.traits.city' },
          then: { '@path': '$.traits.city' },
          else: { '@path': '$.properties.city' }
        } 
      },
      state_province_region: {       
        '@if': {
          exists: { '@path': '$.traits.state' },
          then: { '@path': '$.traits.state' },
          else: { '@path': '$.properties.state' }
        } 
      },
      country: {       
        '@if': {
          exists: { '@path': '$.traits.country' },
          then: { '@path': '$.traits.country' },
          else: { '@path': '$.properties.country' }
        } 
      },
      postal_code: {       
        '@if': {
          exists: { '@path': '$.traits.postal_code' },
          then: { '@path': '$.traits.postal_code' },
          else: { '@path': '$.properties.postal_code' }
        } 
      }
    }
  },
  custom_text_fields: {
    label: 'Custom Text Fields',
    description: `Custom Text Field values to be added to the Contact. Values must be in in string format. The custom field must already exit in Sendgrid.`,
    type: 'object',
    required: false,
    defaultObjectUI: 'keyvalue',
    additionalProperties: true,
    dynamic: true,
    disabledInputMethods: ['literal', 'variable', 'function', 'freeform', 'enrichment']
  },
  custom_number_fields: {
    label: 'Custom Number Fields',
    description: `Custom Number Field values to be added to the Contact. Values must be inumeric. The custom field must already exit in Sendgrid.`,
    type: 'object',
    required: false,
    defaultObjectUI: 'keyvalue',
    additionalProperties: true,
    dynamic: true,
    disabledInputMethods: ['literal', 'variable', 'function', 'freeform', 'enrichment']
  },
  custom_date_fields: {
    label: 'Custom Date Fields',
    description: `Custom Date Field values to be added to the Contact. Values must be in ISO 8601 format. e.g. YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ. The custom field must already exit in Sendgrid.`,
    type: 'object',
    required: false,
    defaultObjectUI: 'keyvalue',
    additionalProperties: true,
    dynamic: true,
    disabledInputMethods: ['literal', 'variable', 'function', 'freeform', 'enrichment']
  },
  enable_batching: {
    type: 'boolean',
    label: 'Batch events',
    description: 'When enabled, the action will batch events before sending them to Sendgrid.',
    unsafe_hidden: true,
    required: true,
    default: true
  },
  batch_size: {
    type: 'number',
    label: 'Max batch size',
    description: 'The maximum number of events to batch when sending data to Reddit.',
    unsafe_hidden: true,
    required: false,
    default: MAX_BATCH_SIZE
  }
}
