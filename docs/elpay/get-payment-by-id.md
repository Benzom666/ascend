# Get payment by ID

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /payment/{paymentId}:
    get:
      summary: Get payment by ID
      deprecated: false
      description: |
        Retrieves the full details of a payment, including current status,
        amounts, buyer info, and settlement data.
      tags:
        - Payments
        - Payments
      parameters:
        - name: paymentId
          in: path
          description: The UUID of the payment returned by `POST /payment`
          required: true
          example: ''
          schema:
            type: string
            format: uuid
            examples:
              - a1b2c3d4-e5f6-7890-abcd-ef1234567890
      responses:
        '200':
          description: Payment details
          content:
            application/json:
              schema:
                type: object
                x-apidog-refs:
                  01KP0N06WD3GH9JB9HJM4C5HK2:
                    $ref: '#/components/schemas/PaymentResponse'
                    x-apidog-overrides:
                      psp_provider: null
                      psp_payment_id: null
                      pay_tariff: null
                      merchant_guid: null
                      merchant_name: null
                      process_status: null
                      process_status_name: null
                      period_id: null
                      period_name: null
                      period_start: null
                      period_end: null
                      psp_amount: null
                      psp_amount_fmt: null
                      end_date: null
                      buyer_first_name: null
                      buyer_last_name: null
                      buyer_birth_date: null
                      buyer_phone: null
                      buyer_address: null
                      buyer_city: null
                      buyer_zip: null
                      buyer_state: null
                x-apidog-orders:
                  - 01KP0N06WD3GH9JB9HJM4C5HK2
                properties:
                  payment_id:
                    type: string
                    format: uuid
                    description: Unique payment identifier
                    examples:
                      - a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  store_id:
                    type: string
                    description: Store identifier
                    examples:
                      - s1000001
                  store_name:
                    type: string
                    description: Store display name
                    examples:
                      - ACME Main Store
                  account_id:
                    type: string
                    description: Merchant settlement account identifier
                    examples:
                      - acc-001
                  payment_num:
                    type: string
                    description: Human-readable payment number
                    examples:
                      - '123'
                  method:
                    type: string
                    description: Payment method code
                    examples:
                      - CARD
                  method_name:
                    type: string
                    description: Payment method display name
                    examples:
                      - Credit / Debit Card
                  is_test:
                    type: boolean
                    description: Whether this is a test-mode payment
                    examples:
                      - false
                  support_email:
                    type: string
                    description: Merchant support email shown to the payer
                    examples:
                      - support@acmeshop.com
                  status:
                    type: string
                    description: >
                      Payment lifecycle status:

                      | Status | Meaning |

                      |---|---|

                      | `CREATED` | Payment was created and is waiting for the
                      payer to start checkout. |

                      | `IN_PROGRESS` | Payment request is being processed. |

                      | `CLOSING` | Payment is in a short transitional closing
                      step before final status. |

                      | `COMPLETED` | Payment finished successfully.  |

                      | `CANCELED` | Payment was canceled or expired before
                      completion. |
                    examples:
                      - COMPLETED
                  status_name:
                    type: string
                    description: Human-readable status label
                    examples:
                      - Completed
                  description:
                    type: string
                    description: Payment description provided at creation
                    examples:
                      - 'Order #1042 — Premium subscription'
                  payment_url:
                    type: string
                    format: uri
                    description: Hosted payment page URL
                    examples:
                      - >-
                        https://pay.elpay.online/a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  request_amount:
                    type: integer
                    format: int64
                    description: Requested amount in minor currency units (e.g. cents)
                    examples:
                      - 4999
                  request_amount_fmt:
                    type: string
                    description: Formatted requested amount
                    examples:
                      - 49.99 USD
                  paid_amount:
                    type: integer
                    format: int64
                    description: >-
                      Amount actually paid by the customer in minor currency
                      units (e.g. cents)
                    examples:
                      - 4999
                  paid_amount_fmt:
                    type: string
                    description: Formatted paid amount
                    examples:
                      - 49.99 USD
                  amount:
                    type: integer
                    format: int64
                    description: Net amount credited to merchant account in minor units
                    examples:
                      - 4849
                  amount_fmt:
                    type: string
                    description: Formatted net amount
                    examples:
                      - 48.49 USD
                  asset_id:
                    type: string
                    description: Currency identifier
                    examples:
                      - USD
                  currency:
                    type: string
                    description: ISO 4217 currency code
                    examples:
                      - USD
                  trx_date:
                    type: string
                    description: Payment initiation timestamp (ISO 8601)
                    examples:
                      - '2024-01-15T10:30:00Z'
                  complete_date:
                    type: string
                    description: Completion timestamp (ISO 8601), empty if not yet complete
                    examples:
                      - '2024-01-15T10:32:17Z'
                  settlement_id:
                    type: string
                    description: Settlement batch identifier
                    examples:
                      - set-20240115
                  settlement_num:
                    type: string
                    description: Settlement reference number
                    examples:
                      - SET-20240115-001
                  settlement_date:
                    type: string
                    description: Settlement date (ISO 8601)
                    examples:
                      - '2024-01-17T00:00:00Z'
                  settlement_amount:
                    type: integer
                    format: int64
                    description: Settled amount in minor units
                    examples:
                      - 4849
                  settlement_amount_fmt:
                    type: string
                    description: Formatted settlement amount
                    examples:
                      - 48.49 USD
                  settlement_asset_id:
                    type: string
                    description: Settlement currency
                    examples:
                      - USD
                  settlement_rate:
                    type: number
                    format: double
                    description: FX rate applied for settlement
                    examples:
                      - 1
                  settlement_rate_date:
                    type: string
                    description: Date the settlement rate was applied
                    examples:
                      - '2024-01-15T00:00:00Z'
                  reserve_id:
                    type: string
                    description: Reserve fund identifier
                    examples:
                      - ''
                  reserve_num:
                    type: string
                    description: Reserve reference number
                    examples:
                      - ''
                  reserve_date:
                    type: string
                    description: Reserve date
                    examples:
                      - ''
                  reserve_amount:
                    type: integer
                    format: int64
                    description: Reserved amount in minor units
                    examples:
                      - 0
                  reserve_amount_fmt:
                    type: string
                    description: Formatted reserved amount
                    examples:
                      - ''
                  reserve_asset_id:
                    type: string
                    description: Reserve currency
                    examples:
                      - ''
                  reserve_rate:
                    type: number
                    format: double
                    description: FX rate for reserve
                    examples:
                      - 0
                  reserve_rate_date:
                    type: string
                    description: Date reserve rate was applied
                    examples:
                      - ''
                  buyer_email:
                    type: string
                    description: Payer email address
                    examples:
                      - jane.smith@example.com
                  buyer_country:
                    type: string
                    description: Payer country (ISO 3166-1 alpha-2)
                    examples:
                      - US
                  buyer_lang:
                    type: string
                    description: Payer preferred language
                    examples:
                      - en
                  ip_address:
                    type: string
                    description: Payer IP address at time of payment
                    examples:
                      - 203.0.113.42
                  webhook_url:
                    type: string
                    description: Webhook notification URL configured for this payment
                    examples:
                      - https://yourshop.com/webhooks/payment
                  success_url:
                    type: string
                    description: Redirect URL on success
                    examples:
                      - https://yourshop.com/order/1042/success
                  cancel_url:
                    type: string
                    description: Redirect URL on cancel
                    examples:
                      - https://yourshop.com/order/1042/cancel
                  custom:
                    type: string
                    description: Custom reference field
                    examples:
                      - order-1042
                  custom1:
                    type: string
                  custom2:
                    type: string
                  custom3:
                    type: string
                  custom4:
                    type: string
                  custom5:
                    type: string
                  custom6:
                    type: string
                  custom7:
                    type: string
                  custom8:
                    type: string
                  custom9:
                    type: string
                  app_id:
                    type: string
                    description: Application identifier
                    examples:
                      - ''
                  app_name:
                    type: string
                    description: Application name
                    examples:
                      - ''
                  creation_date:
                    type: string
                    description: Record creation timestamp
                    examples:
                      - '2024-01-15T10:30:00Z'
                  created_by:
                    type: string
                    description: Creator identifier
                    examples:
                      - api
                  updated_date:
                    type: string
                    description: Last update timestamp
                    examples:
                      - '2024-01-15T10:32:17Z'
                  updated_by:
                    type: string
                    description: Last updater identifier
                    examples:
                      - system
                x-apidog-ignore-properties:
                  - payment_id
                  - store_id
                  - store_name
                  - account_id
                  - payment_num
                  - method
                  - method_name
                  - is_test
                  - support_email
                  - status
                  - status_name
                  - description
                  - payment_url
                  - request_amount
                  - request_amount_fmt
                  - paid_amount
                  - paid_amount_fmt
                  - amount
                  - amount_fmt
                  - asset_id
                  - currency
                  - trx_date
                  - complete_date
                  - settlement_id
                  - settlement_num
                  - settlement_date
                  - settlement_amount
                  - settlement_amount_fmt
                  - settlement_asset_id
                  - settlement_rate
                  - settlement_rate_date
                  - reserve_id
                  - reserve_num
                  - reserve_date
                  - reserve_amount
                  - reserve_amount_fmt
                  - reserve_asset_id
                  - reserve_rate
                  - reserve_rate_date
                  - buyer_email
                  - buyer_country
                  - buyer_lang
                  - ip_address
                  - webhook_url
                  - success_url
                  - cancel_url
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
                  - app_id
                  - app_name
                  - creation_date
                  - created_by
                  - updated_date
                  - updated_by
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
        '404':
          description: Payment not found
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
              - id: gjjWp8yJKgex23XXG7FGK
                schemeIds:
                  - BasicAuth
            required: true
            use:
              id: gjjWp8yJKgex23XXG7FGK
            scopes:
              gjjWp8yJKgex23XXG7FGK:
                BasicAuth: []
      x-apidog-folder: Payments
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1256138/apis/api-33169848-run
components:
  schemas:
    PaymentResponse:
      type: object
      description: Full payment details
      properties:
        payment_id:
          type: string
          format: uuid
          description: Unique payment identifier
          examples:
            - a1b2c3d4-e5f6-7890-abcd-ef1234567890
        store_id:
          type: string
          description: Store identifier
          examples:
            - s1000001
        store_name:
          type: string
          description: Store display name
          examples:
            - ACME Main Store
        account_id:
          type: string
          description: Merchant settlement account identifier
          examples:
            - acc-001
        payment_num:
          type: string
          description: Human-readable payment number
          examples:
            - '123'
        method:
          type: string
          description: Payment method code
          examples:
            - CARD
        method_name:
          type: string
          description: Payment method display name
          examples:
            - Credit / Debit Card
        is_test:
          type: boolean
          description: Whether this is a test-mode payment
          examples:
            - false
        support_email:
          type: string
          description: Merchant support email shown to the payer
          examples:
            - support@acmeshop.com
        status:
          type: string
          description: >
            Payment lifecycle status:

            | Status | Meaning |

            |---|---|

            | `CREATED` | Payment was created and is waiting for the payer to
            start checkout. |

            | `IN_PROGRESS` | Payment request is being processed. |

            | `CLOSING` | Payment is in a short transitional closing step before
            final status. |

            | `COMPLETED` | Payment finished successfully.  |

            | `CANCELED` | Payment was canceled or expired before completion. |
          examples:
            - COMPLETED
        status_name:
          type: string
          description: Human-readable status label
          examples:
            - Completed
        description:
          type: string
          description: Payment description provided at creation
          examples:
            - 'Order #1042 — Premium subscription'
        payment_url:
          type: string
          format: uri
          description: Hosted payment page URL
          examples:
            - https://pay.elpay.online/a1b2c3d4-e5f6-7890-abcd-ef1234567890
        request_amount:
          type: integer
          format: int64
          description: Requested amount in minor currency units (e.g. cents)
          examples:
            - 4999
        request_amount_fmt:
          type: string
          description: Formatted requested amount
          examples:
            - 49.99 USD
        paid_amount:
          type: integer
          format: int64
          description: >-
            Amount actually paid by the customer in minor currency units (e.g.
            cents)
          examples:
            - 4999
        paid_amount_fmt:
          type: string
          description: Formatted paid amount
          examples:
            - 49.99 USD
        amount:
          type: integer
          format: int64
          description: Net amount credited to merchant account in minor units
          examples:
            - 4849
        amount_fmt:
          type: string
          description: Formatted net amount
          examples:
            - 48.49 USD
        asset_id:
          type: string
          description: Currency identifier
          examples:
            - USD
        currency:
          type: string
          description: ISO 4217 currency code
          examples:
            - USD
        trx_date:
          type: string
          description: Payment initiation timestamp (ISO 8601)
          examples:
            - '2024-01-15T10:30:00Z'
        complete_date:
          type: string
          description: Completion timestamp (ISO 8601), empty if not yet complete
          examples:
            - '2024-01-15T10:32:17Z'
        settlement_id:
          type: string
          description: Settlement batch identifier
          examples:
            - set-20240115
        settlement_num:
          type: string
          description: Settlement reference number
          examples:
            - SET-20240115-001
        settlement_date:
          type: string
          description: Settlement date (ISO 8601)
          examples:
            - '2024-01-17T00:00:00Z'
        settlement_amount:
          type: integer
          format: int64
          description: Settled amount in minor units
          examples:
            - 4849
        settlement_amount_fmt:
          type: string
          description: Formatted settlement amount
          examples:
            - 48.49 USD
        settlement_asset_id:
          type: string
          description: Settlement currency
          examples:
            - USD
        settlement_rate:
          type: number
          format: double
          description: FX rate applied for settlement
          examples:
            - 1
        settlement_rate_date:
          type: string
          description: Date the settlement rate was applied
          examples:
            - '2024-01-15T00:00:00Z'
        reserve_id:
          type: string
          description: Reserve fund identifier
          examples:
            - ''
        reserve_num:
          type: string
          description: Reserve reference number
          examples:
            - ''
        reserve_date:
          type: string
          description: Reserve date
          examples:
            - ''
        reserve_amount:
          type: integer
          format: int64
          description: Reserved amount in minor units
          examples:
            - 0
        reserve_amount_fmt:
          type: string
          description: Formatted reserved amount
          examples:
            - ''
        reserve_asset_id:
          type: string
          description: Reserve currency
          examples:
            - ''
        reserve_rate:
          type: number
          format: double
          description: FX rate for reserve
          examples:
            - 0
        reserve_rate_date:
          type: string
          description: Date reserve rate was applied
          examples:
            - ''
        buyer_email:
          type: string
          description: Payer email address
          examples:
            - jane.smith@example.com
        buyer_country:
          type: string
          description: Payer country (ISO 3166-1 alpha-2)
          examples:
            - US
        buyer_lang:
          type: string
          description: Payer preferred language
          examples:
            - en
        ip_address:
          type: string
          description: Payer IP address at time of payment
          examples:
            - 203.0.113.42
        webhook_url:
          type: string
          description: Webhook notification URL configured for this payment
          examples:
            - https://yourshop.com/webhooks/payment
        success_url:
          type: string
          description: Redirect URL on success
          examples:
            - https://yourshop.com/order/1042/success
        cancel_url:
          type: string
          description: Redirect URL on cancel
          examples:
            - https://yourshop.com/order/1042/cancel
        custom:
          type: string
          description: Custom reference field
          examples:
            - order-1042
        custom1:
          type: string
        custom2:
          type: string
        custom3:
          type: string
        custom4:
          type: string
        custom5:
          type: string
        custom6:
          type: string
        custom7:
          type: string
        custom8:
          type: string
        custom9:
          type: string
        app_id:
          type: string
          description: Application identifier
          examples:
            - ''
        app_name:
          type: string
          description: Application name
          examples:
            - ''
        creation_date:
          type: string
          description: Record creation timestamp
          examples:
            - '2024-01-15T10:30:00Z'
        created_by:
          type: string
          description: Creator identifier
          examples:
            - api
        updated_date:
          type: string
          description: Last update timestamp
          examples:
            - '2024-01-15T10:32:17Z'
        updated_by:
          type: string
          description: Last updater identifier
          examples:
            - system
      x-apidog-orders:
        - payment_id
        - store_id
        - store_name
        - account_id
        - payment_num
        - method
        - method_name
        - is_test
        - support_email
        - status
        - status_name
        - description
        - payment_url
        - request_amount
        - request_amount_fmt
        - paid_amount
        - paid_amount_fmt
        - amount
        - amount_fmt
        - asset_id
        - currency
        - trx_date
        - complete_date
        - settlement_id
        - settlement_num
        - settlement_date
        - settlement_amount
        - settlement_amount_fmt
        - settlement_asset_id
        - settlement_rate
        - settlement_rate_date
        - reserve_id
        - reserve_num
        - reserve_date
        - reserve_amount
        - reserve_amount_fmt
        - reserve_asset_id
        - reserve_rate
        - reserve_rate_date
        - buyer_email
        - buyer_country
        - buyer_lang
        - ip_address
        - webhook_url
        - success_url
        - cancel_url
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
        - app_id
        - app_name
        - creation_date
        - created_by
        - updated_date
        - updated_by
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
