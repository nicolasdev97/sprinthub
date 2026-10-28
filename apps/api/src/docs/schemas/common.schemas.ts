export const commonSchemas = {
  ErrorResponse: {
    type: 'object',
    required: ['success', 'message'],
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      message: {
        type: 'string',
        example: 'Resource not found or unauthorized operation',
      },
    },
  },
  ValidationErrorResponse: {
    type: 'object',
    required: ['success', 'message'],
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      message: {
        type: 'string',
        example:
          'body.email: Invalid email address, body.password: Password must be at least 8 characters',
      },
    },
  },
  MessageResponse: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        example: 'Operation completed successfully',
      },
    },
  },
  UuidParam: {
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  },
};
