# CreatePaymentResponse

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
      x-apidog-folder: ''
  securitySchemes: {}
servers: []
security: []

```
