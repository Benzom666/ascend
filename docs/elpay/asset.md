# Asset

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths: {}
components:
  schemas:
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
      x-apidog-folder: ''
  securitySchemes: {}
servers: []
security: []

```
