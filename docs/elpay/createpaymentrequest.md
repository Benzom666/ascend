# CreatePaymentRequest

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
    CreatePaymentRequest:
      type: object
      required:
        - idempotency_key
        - amount
        - asset_id
        - payer_email
      properties:
        idempotency_key:
          type: string
          maxLength: 100
          description: >
            Your unique key for this payment. If a payment with this key already

            exists, the existing payment is returned instead of creating a new
            one.

            Use your internal order ID or a UUID.
          examples:
            - order-7f3a92bc
        method:
          type: string
          description: Payment method. Currently only `CARD` is supported.
          enum:
            - CARD
          default: CARD
          examples:
            - CARD
        amount:
          type: integer
          description: >-
            Payment amount in cents in the currency specified by `asset_id`.
            Must be greater than 0.
          format: int64
        asset_id:
          type: string
          description: >-
            Currency for this payment. Supported values&#58; `USD`, `EUR`,
            `GBP`, `CAD`.
          enum:
            - USD
            - EUR
            - GBP
            - CAD
          examples:
            - USD
        description:
          type: string
          description: Human-readable description shown to the payer on the payment page.
          examples:
            - 'Order #1042 — Premium subscription'
        payer_first_name:
          type: string
          description: Payer first name
          examples:
            - Jane
        payer_last_name:
          type: string
          description: Payer last name
          examples:
            - Smith
        payer_birth_date:
          type: string
          description: Payer date of birth (`YYYY-MM-DD`)
          examples:
            - '1990-06-15'
        payer_email:
          type: string
          format: email
          description: Payer email address (required)
          examples:
            - jane.smith@example.com
        payer_phone:
          type: string
          description: Payer phone number
          examples:
            - '+12025550147'
        payer_address:
          type: string
          description: Payer street address
          examples:
            - 123 Main St
        payer_city:
          type: string
          description: Payer city
          examples:
            - New York
        payer_state:
          type: string
          description: Payer state / province
          examples:
            - NY
        payer_zip:
          type: string
          description: Payer postal code
          examples:
            - '10001'
        payer_country:
          type: string
          description: Payer country (ISO 3166-1 alpha-2, required)
          examples:
            - US
        payer_lang:
          type: string
          description: Payer preferred language code (`en`, `ru`, …). Defaults to `en`.
          default: en
          examples:
            - en
        webhook_url:
          type: string
          format: uri
          description: >
            URL where payment status change notifications are sent (POST).

            Must be a valid HTTPS URL. See the [Webhook
            Notifications](#section/Webhook-Notifications) section.
          examples:
            - https://yourshop.com/webhooks/payment
        success_url:
          type: string
          format: uri
          description: URL to redirect the payer to after a successful payment.
          examples:
            - https://yourshop.com/order/1042/success
        cancel_url:
          type: string
          format: uri
          description: URL to redirect the payer to if they cancel the payment.
          examples:
            - https://yourshop.com/order/1042/cancel
        timeout:
          type: integer
          format: int32
          description: |
            Seconds the payer has to complete the payment before it expires.
            Defaults to the asset's `timeout_to_trx` when omitted.
          examples:
            - 900
        custom:
          type: string
          description: >-
            Your reference data passed through to webhook notifications (up to
            255 chars).
          examples:
            - order-1042
        custom1:
          type: string
          description: Additional custom field 1
        custom2:
          type: string
          description: Additional custom field 2
        custom3:
          type: string
          description: Additional custom field 3
        custom4:
          type: string
          description: Additional custom field 4
        custom5:
          type: string
          description: Additional custom field 5
        custom6:
          type: string
          description: Additional custom field 6
        custom7:
          type: string
          description: Additional custom field 7
        custom8:
          type: string
          description: Additional custom field 8
        custom9:
          type: string
          description: Additional custom field 9
      x-apidog-orders:
        - idempotency_key
        - method
        - amount
        - asset_id
        - description
        - payer_first_name
        - payer_last_name
        - payer_birth_date
        - payer_email
        - payer_phone
        - payer_address
        - payer_city
        - payer_state
        - payer_zip
        - payer_country
        - payer_lang
        - webhook_url
        - success_url
        - cancel_url
        - timeout
        - custom
        - custom1
        - custom2
        - custom3
        - custom4
        - custom5
        - custom6
        - custom7
        - custom8
        - custom9
      x-apidog-folder: ''
  securitySchemes: {}
servers: []
security: []

```
