# Create a payment

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /payment:
    post:
      summary: Create a payment
      deprecated: false
      description: |
        Creates a new payment intent and returns a hosted payment page URL
        (`payment_url`) to which you redirect your customer.

        The request is idempotent — if you send the same `idempotency_key`
        twice, the second call returns the original payment instead of creating
        a duplicate.

        **Supported assets:** `USD`, `EUR`, `GBP`, `CAD`
      tags:
        - Payments
        - Payments
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePaymentRequest'
            example:
              idempotency_key: 5cfaba4f-0522-4239-9ddf-5dd677259f50
              method: CARD
              amount: 5000
              asset_id: USD
              description: 'Order #1042 — Premium subscription'
              payer_first_name: Jane
              payer_last_name: Smith
              payer_email: jane.smith@example.com
              payer_country: US
              payer_lang: en
              webhook_url: https://yourshop.com/webhooks/payment
              success_url: https://yourshop.com/order/1042/success
              cancel_url: https://yourshop.com/order/1042/cancel
              timeout: 900
              custom: order-1042
      responses:
        '200':
          description: Payment created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreatePaymentResponse'
              example:
                payment_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                payment_num: '1'
                is_test: false
                status: CREATED
                start_date: '2024-01-15T10:30:00Z'
                end_date: '2024-01-15T10:45:00Z'
                payment_url: >-
                  https://elpay.checkout/payment/a1b2c3d4-e5f6-7890-abcd-ef1234567890
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
              - id: PwvO_Ysjr5lmskHwOdzdx
                schemeIds:
                  - BasicAuth
            required: true
            use:
              id: PwvO_Ysjr5lmskHwOdzdx
            scopes:
              PwvO_Ysjr5lmskHwOdzdx:
                BasicAuth: []
      x-apidog-folder: Payments
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1256138/apis/api-33169847-run
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
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    CreatePaymentResponse:
      type: object
      description: Result of a successful payment creation
      properties:
        payment_id:
          type: string
          format: uuid
          description: Unique payment identifier — use it to query status later
          examples:
            - a1b2c3d4-e5f6-7890-abcd-ef1234567890
        payment_num:
          type: string
          description: Human-readable payment number
          examples:
            - PAY-20240115-0042
        is_test:
          type: boolean
          description: Whether this is a test-mode payment
          examples:
            - false
        status:
          type: string
          description: Initial payment status (always `NEW` on creation)
          examples:
            - NEW
        start_date:
          type: string
          description: Payment creation timestamp (ISO 8601)
          examples:
            - '2024-01-15T10:30:00Z'
        end_date:
          type: string
          description: Payment expiry timestamp (ISO 8601)
          examples:
            - '2024-01-15T10:45:00Z'
        payment_url:
          type: string
          format: uri
          description: |
            Hosted payment page URL. **Redirect your customer here** to complete
            the payment. Valid until `end_date`.
          examples:
            - https://pay.elpay.online/a1b2c3d4-e5f6-7890-abcd-ef1234567890
      x-apidog-orders:
        - payment_id
        - payment_num
        - is_test
        - status
        - start_date
        - end_date
        - payment_url
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
