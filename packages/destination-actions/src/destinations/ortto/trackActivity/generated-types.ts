// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
  /**
   * Event timestamp
   */
  timestamp?: string
  /**
   * Message ID
   */
  message_id?: string
  /**
   * The unique user identifier
   */
  user_id?: string
  /**
   * Anonymous user identifier
   */
  anonymous_id?: string
  /**
   * When enabled, events will be sent to Ortto in batches for improved efficiency.
   */
  enable_batching?: boolean
  /**
   * Event namespace
   */
  namespace?: string
  /**
   * Event name
   */
  event: string
  /**
   * An object containing key-value pairs representing activity attributes
   */
  properties?: {
    [k: string]: unknown
  }
  /**
   * When provided the associated contact profile will be updated/created
   */
  contact_profile?: {
    /**
     * Specifies how to assign the contact's location
     */
    geo_mode?: string
    /**
     * The contact's IP address
     */
    ip?: string | null
    /**
     * The contact's location
     */
    location?: {
      country?: string | null
      state?: string | null
      city?: string | null
      post_code?: string | null
    }
    /**
     * When provided, it contains key-value pairs representing custom properties assigned to the associated contact profile
     */
    traits?: {
      /**
       * The contact's email address
       */
      email?: string
      /**
       * The contact's phone number
       */
      phone?: string
      /**
       * The contact's first name
       */
      first_name?: string
      /**
       * The contact's last name
       */
      last_name?: string
    }
  }
}
