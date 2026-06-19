# List available assets

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /assets:
    get:
      summary: List available assets
      deprecated: false
      description: >
        Returns all payment assets (currencies) that are available for your
        store.

        Use the `asset_id` values from this response when creating payments.
      tags:
        - Assets
        - Assets
      parameters: []
      responses:
        '200':
          description: List of available assets
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AssetsResponse'
              example:
                - asset_id: USD
                  asset_name: US Dollar
                  currency: USD
                  currency_name: US Dollar
                  asset_type: FIAT
                  asset_type_name: Fiat currency
                  symbol: $
                  sort_order: 1
                  min_size: 1
                  precision: 2
          headers: {}
          x-apidog-name: ''
        '401':
          description: Invalid or missing API credentials
          headers: {}
          x-apidog-name: ''
        '422':
          description: ''
          content:
            application/json:
              schema: &ref_0
                $ref: '#/components/schemas/ErrorResponse'
              example:
                code: ERR_VALIDATION
                message: Validation failed
                fields:
                  - field: payer_email
                    message: Invalid email address
          headers: {}
          x-apidog-name: BusinessError
        '503':
          description: ''
          content:
            application/json:
              schema: *ref_0
              example:
                code: ERR_OUT_OF_SERVICE
                message: Service is temporarily unavailable
          headers: {}
          x-apidog-name: OutOfService
      security:
        - BasicAuth: []
          x-apidog:
            schemeGroups:
              - id: QMV2I51VirFzYTxj2NdVw
                schemeIds:
                  - BasicAuth
            required: true
            use:
              id: QMV2I51VirFzYTxj2NdVw
            scopes:
              QMV2I51VirFzYTxj2NdVw:
                BasicAuth: []
      x-apidog-folder: Assets
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1256138/apis/api-33169846-run
components:
  schemas:
    AssetsResponse:
      type: array
      items:
        $ref: '#/components/schemas/Asset'
      x-apidog-folder: ''
    Asset:
      type: object
      description: A payment asset (currency / token) available for processing
      properties:
        asset_id:
          type: string
          description: >-
            Unique asset identifier used when creating payments (e.g. `USD`,
            `EUR`)
          examples:
            - USD
        asset_name:
          type: string
          description: Human-readable asset name
          examples:
            - US Dollar
        currency:
          type: string
          description: ISO 4217 currency code
          examples:
            - USD
        currency_name:
          type: string
          description: Currency full name
          examples:
            - US Dollar
        language:
          type: string
          description: Language code of the asset metadata
          examples:
            - en
        asset_type:
          type: string
          description: Asset type code (`FIAT`, `CRYPTO`)
          examples:
            - FIAT
        asset_type_name:
          type: string
          description: Human-readable asset type
          examples:
            - Fiat currency
        symbol:
          type: string
          description: Currency symbol
          examples:
            - $
        sort_order:
          type: integer
          format: int32
          description: Display sort order
          examples:
            - 1
        min_size:
          type: number
          format: double
          description: Minimum transaction amount
          examples:
            - 1
        precision:
          type: integer
          format: int32
          description: Number of decimal places
          examples:
            - 2
      x-apidog-orders:
        - asset_id
        - asset_name
        - currency
        - currency_name
        - language
        - asset_type
        - asset_type_name
        - symbol
        - sort_order
        - min_size
        - precision
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    ErrorResponse:
      type: object
      properties:
        code:
          type: string
          description: Machine-readable error code
          examples:
            - ERR_VALIDATION
        message:
          type: string
          description: Human-readable error description
          examples:
            - Validation failed
        fields:
          type: array
          description: Field-level validation errors (present on `ERR_VALIDATION` only)
          items:
            $ref: '#/components/schemas/ErrorField'
      x-apidog-orders:
        - code
        - message
        - fields
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    ErrorField:
      type: object
      properties:
        field:
          type: string
          description: Field name that failed validation
          examples:
            - payer_email
        message:
          type: string
          description: Human-readable error message for this field
          examples:
            - Invalid email address
      x-apidog-orders:
        - field
        - message
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
  securitySchemes:
    BasicAuth:
      type: basic
      scheme: basic
      description: >
        Use your Store **API Key** as the username and **API Secret** as the
        password.

        Find these in the Merchant Portal under **Store → API Settings**.
servers: []
security:
  - BasicAuth: []
    x-apidog:
      schemeGroups:
        - id: jSeB3r9Z6Hpy7lW8Y57Si
          schemeIds:
            - BasicAuth
      required: true
      use:
        id: jSeB3r9Z6Hpy7lW8Y57Si
      scopes:
        jSeB3r9Z6Hpy7lW8Y57Si:
          BasicAuth: []

```
