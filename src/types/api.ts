// Field name -> error message, e.g. { price: "Input should be greater than or equal to 0" }.
// Nested fields use dots: "items.0.quantity".
export type FieldErrors = Record<string, string>

// Every failed request is turned into this one error type, whatever the backend returned.
// status 0 means the server could not be reached at all.
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}
