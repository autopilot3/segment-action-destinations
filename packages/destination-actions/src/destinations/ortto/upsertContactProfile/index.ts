import type { ActionDefinition, DynamicFieldResponse, APIError } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import OrttoClient from '../ortto-client'
import { commonFields } from '../common-fields'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Update Contact',
  description: 'Update contact profile',
  defaultSubscription: 'type = "identify"',
  fields: {
    timestamp: commonFields.timestamp,
    message_id: commonFields.message_id,
    user_id: commonFields.user_id,
    anonymous_id: commonFields.anonymous_id,
    enable_batching: commonFields.enable_batching,
    ip: commonFields.ipV4,
    location: commonFields.location,
    traits: commonFields.traits,
    audience_id: {
      label: 'Audience',
      description: `The Audience to add the contact profile to.`,
      type: 'string',
      dynamic: true
    }
  },
  dynamicFields: {
    audience_id: async (request, { settings }): Promise<DynamicFieldResponse> => {
      const client: OrttoClient = new OrttoClient(request)
      return await client.listAudiences(settings)
    }
  },
  hooks: {
    retlOnMappingSave: {
      label: 'Connect the action to an Audience in Ortto',
      description: 'When saving this mapping, this action will be linked to an audience in Ortto.',
      inputFields: {
        name: {
          type: 'string',
          label: 'The name of the Audience to create (Optional)',
          description:
            'Enter the name of the audience you want to create in Ortto. Audience names are unique for each Segment data source. If a contact profile has an Audience field explicitly set, that value will take precedence.',
          required: false
        }
      },
      outputTypes: {
        id: {
          type: 'string',
          label: 'ID',
          description: 'The ID of the Ortto audience to which contacts will be synced.',
          required: false
        },
        name: {
          type: 'string',
          label: 'Name',
          description: 'The name of the Ortto audience to which contacts will be synced.',
          required: false
        }
      },
      performHook: async (request, { settings, hookInputs }) => {
        if (hookInputs.name) {
          try {
            const client: OrttoClient = new OrttoClient(request)
            const audience = await client.createAudience(settings, hookInputs.name as string)
            return {
              successMessage: `Audience '${audience.name}' (id: ${audience.id}) has been created successfully.`,
              savedData: {
                id: audience.id,
                name: audience.name
              }
            }
          } catch (err) {
            return {
              error: {
                message: (err as APIError).message ?? 'Unknown Error',
                code: (err as APIError).status?.toString() ?? 'Unknown Error'
              }
            }
          }
        }
        return {}
      }
    }
  },
  perform: async (request, { settings, payload, hookOutputs }) => {
    const client: OrttoClient = new OrttoClient(request)
    return await client.upsertContacts(
      settings,
      [payload],
      (hookOutputs?.retlOnMappingSave?.outputs?.id as string) ?? ''
    )
  },
  performBatch: async (request, { settings, payload, hookOutputs }) => {
    console.log('BATCH', hookOutputs?.retlOnMappingSave?.outputs?.id)
    const client: OrttoClient = new OrttoClient(request)
    return await client.upsertContacts(settings, payload, (hookOutputs?.retlOnMappingSave?.outputs?.id as string) ?? '')
  }
}

export default action
