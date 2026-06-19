# ErrorResponse

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
      x-apidog-folder: ''
  securitySchemes: {}
servers: []
security: []

```
