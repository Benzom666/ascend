# ErrorField

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
      x-apidog-folder: ''
  securitySchemes: {}
servers: []
security: []

```
