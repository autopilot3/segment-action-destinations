import {
  InvalidAuthenticationError,
  PayloadValidationError,
  RequestClient,
  DynamicFieldResponse,
  APIError
} from '@segment/actions-core'
import { Settings, AudienceSettings } from './generated-types'
import { Payload as UpsertContactPayload } from './upsertContactProfile/generated-types'
import { Payload as EventPayload } from './trackActivity/generated-types'
import { cleanObject } from './utils'
import { AudienceList, UpdateAudienceRequest } from './types'

export const API_VERSION = 'v1'

export const Errors: Record<string, string> = {
  MissingIDs: `Either user ID or anonymous ID must be specified`,
  InvalidAPIKey: `Invalid API key`,
  MissingEventName: `Missing event name`,
  MissingAudienceName: `Missing audience name`,
  MissingAudienceId: `Missing audience Id`,
  MissingContactID: `At least one contact Id must be provided`
}
export default class OrttoClient {
  request: RequestClient
  constructor(request: RequestClient) {
    this.request = request
  }

  upsertContacts = async (settings: Settings, payloads: UpsertContactPayload[]) => {
    const cleaned = []
    for (let i = 0; i < payloads.length; i++) {
      const event = payloads[i]
      if (!event.anonymous_id && !event.user_id) {
        throw new PayloadValidationError(Errors.MissingIDs)
      }
      cleaned.push(cleanObject(event))
    }
    if (cleaned.length == 0) {
      return
    }
    const url = this.getEndpoint(settings.api_key).concat('/identify')
    return this.request(url, {
      method: 'POST',
      json: cleaned
    })
  }

  sendActivities = async (settings: Settings, payloads: EventPayload[]) => {
    const filtered = []
    for (let i = 0; i < payloads.length; i++) {
      const event = payloads[i]
      if (!event.anonymous_id && !event.user_id) {
        throw new PayloadValidationError(Errors.MissingIDs)
      }
      if (!event.event || event.event.trim() === '') {
        throw new PayloadValidationError(Errors.MissingEventName)
      }
      if (event.namespace === 'ortto.com') {
        continue
      }
      filtered.push(cleanObject(event))
    }
    if (filtered.length == 0) {
      return
    }
    const url = this.getEndpoint(settings.api_key).concat(`/track`)
    return this.request(url, {
      method: 'POST',
      json: filtered
    })
  }

  testAuth = async (settings: Settings) => {
    const url = this.getEndpoint(settings.api_key).concat('/me')
    return this.request(url, {
      method: 'GET'
    })
  }

  // Audiences

  createAudience = async (settings: Settings, audienceSettings: AudienceSettings | undefined, audienceName: string) => {
    const defaultAudienceId = audienceSettings?.audienceId
    if (defaultAudienceId) {
      return { externalId: defaultAudienceId }
    }

    if (!audienceName) {
      throw new PayloadValidationError(Errors.MissingAudienceName)
    }
    const url = this.getEndpoint(settings.api_key).concat('/audience/create')
    const response = await this.request(url, {
      method: 'POST',
      json: { name: audienceName }
    })
    const r = await response.json()
    return {
      externalId: r.data.id
    }
  }

  getAudience = async (settings: Settings, audienceSettings: AudienceSettings | undefined, externalId: string) => {
    let audienceId = externalId
    const defaultAudienceId = audienceSettings?.audienceId
    if (defaultAudienceId) {
      audienceId = defaultAudienceId
    }

    if (!audienceId) {
      throw new PayloadValidationError(Errors.MissingAudienceId)
    }

    const url = this.getEndpoint(settings.api_key).concat('/audience/get')
    const response = await this.request(url, {
      method: 'POST',
      json: { id: audienceId }
    })

    const r = await response.json()

    return {
      externalId: r.data.id
    }
  }

  listAudiences = async (settings: Settings): Promise<DynamicFieldResponse> => {
    const url = this.getEndpoint(settings.api_key).concat('/audience/list')
    try {
      const response = await this.request<AudienceList>(url, {
        method: 'GET',
        skipResponseCloning: true
      })
      const choices = response.data.audiences.map((audience) => {
        return { value: audience.id, label: audience.name }
      })
      return {
        choices: choices
      }
    } catch (err) {
      return {
        choices: [],
        nextPage: '',
        error: {
          message: (err as APIError).message ?? 'Unknown Error',
          code: (err as APIError).status?.toString() ?? 'Unknown Error'
        }
      }
    }
  }

  addContactsToAudience = async (settings: Settings, req: UpdateAudienceRequest) => {
    if (!req.audience_id) {
      throw new PayloadValidationError(Errors.MissingAudienceId)
    }
    if (req.contact_ids === undefined || req.contact_ids.length == 0) {
      throw new PayloadValidationError(Errors.MissingContactID)
    }
    const url = this.getEndpoint(settings.api_key).concat('/audience/members')
    return this.request(url, {
      method: 'PUT',
      json: req
    })
  }

  removeContactsFromAudience = async (settings: Settings, req: UpdateAudienceRequest) => {
    if (!req.audience_id) {
      throw new PayloadValidationError(Errors.MissingAudienceId)
    }
    if (req.contact_ids === undefined || req.contact_ids.length == 0) {
      throw new PayloadValidationError(Errors.MissingContactID)
    }
    const url = this.getEndpoint(settings.api_key).concat('/audience/members')
    return this.request(url, {
      method: 'DELETE',
      json: req
    })
  }

  // Audiences END

  private getEndpoint(apiKey: string): string {
    if (process?.env?.ORTTO_LOCAL_ENDPOINT) {
      return `${process?.env?.ORTTO_LOCAL_ENDPOINT}/${API_VERSION}`
    }
    if (!apiKey) {
      throw new InvalidAuthenticationError(Errors.InvalidAPIKey)
    }
    const idx = apiKey.indexOf('-')
    if (idx != 3) {
      throw new InvalidAuthenticationError(Errors.InvalidAPIKey)
    }

    let env = ''
    if (apiKey.charAt(0) == 's') {
      env = '-stg'
    }
    const region = apiKey.substring(1, idx).trim()
    if (region.length != 2) {
      throw new InvalidAuthenticationError(Errors.InvalidAPIKey)
    }

    return `https://segment-action-api-${region}.ortto${env}.app/${API_VERSION}`
  }
}
