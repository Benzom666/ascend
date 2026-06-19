# WebhookPayment

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
    WebhookPayment:
      type: object
      description: Payment data embedded in a webhook notification
      properties:
        payment_id:
          type: string
          format: uuid
          examples:
            - a1b2c3d4-e5f6-7890-abcd-ef1234567890
        merchant_guid:
          type: string
          examples:
            - m1b2c3d4-0000-0000-0000-ef1234567890
        merchant_name:
          type: string
          examples:
            - ACME Shop
        store_id:
          type: string
          examples:
            - s1000001
        store_name:
          type: string
          examples:
            - ACME Main Store
        store_url:
          type: string
          examples:
            - https://acmeshop.com
        account_id:
          type: string
          examples:
            - acc-001
        payment_num:
          type: string
          examples:
            - PAY-20240115-0042
        method:
          type: string
          examples:
            - CARD
        method_name:
          type: string
          examples:
            - Credit / Debit Card
        is_test:
          type: boolean
          examples:
            - false
        support_email:
          type: string
          examples:
            - support@acmeshop.com
        status:
          type: string
          examples:
            - COMPLETE
        status_name:
          type: string
          examples:
            - Completed
        description:
          type: string
          examples:
            - 'Order #1042 — Premium subscription'
        payment_url:
          type: string
          examples:
            - https://pay.elpay.online/a1b2c3d4-e5f6-7890-abcd-ef1234567890
        request_amount:
          type: integer
          format: int64
          examples:
            - 4999
        request_amount_fmt:
          type: string
          examples:
            - 49.99 USD
        amount:
          type: integer
          format: int64
          examples:
            - 4849
        amount_fmt:
          type: string
          examples:
            - 48.49 USD
        asset_id:
          type: string
          examples:
            - USD
        currency:
          type: string
          examples:
            - USD
        trx_date:
          type: string
          examples:
            - '2024-01-15T10:30:00Z'
        end_date:
          type: string
          examples:
            - '2024-01-15T10:45:00Z'
        complete_date:
          type: string
          examples:
            - '2024-01-15T10:32:17Z'
        buyer_email:
          type: string
          examples:
            - jane.smith@example.com
        buyer_country:
          type: string
          examples:
            - US
        webhook_url:
          type: string
          examples:
            - https://yourshop.com/webhooks/payment
        success_url:
          type: string
          examples:
            - https://yourshop.com/order/1042/success
        cancel_url:
          type: string
          examples:
            - https://yourshop.com/order/1042/cancel
        custom:
          type: string
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
        creation_date:
          type: string
          examples:
            - '2024-01-15T10:30:00Z'
      x-apidog-orders:
        - payment_id
        - merchant_guid
        - merchant_name
        - store_id
        - store_name
        - store_url
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
        - amount
        - amount_fmt
        - asset_id
        - currency
        - trx_date
        - end_date
        - complete_date
        - buyer_email
        - buyer_country
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
        - creation_date
      x-apidog-folder: ''
  securitySchemes: {}
servers: []
security: []

```
