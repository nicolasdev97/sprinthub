export const authSchemas = {
  RegisterRequest: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password'],
    properties: {
      firstName: {
        type: 'string',
        example: 'Jane',
        description: 'First name of the user (minimum 1 character)',
      },
      lastName: {
        type: 'string',
        example: 'Doe',
        description: 'Last name of the user (minimum 1 character)',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'jane.doe@example.com',
        description: 'Valid, unique email address',
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        example: 'Str0ngP@ssw0rd!',
        description: 'Plaintext password (minimum 8 characters)',
      },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'jane.doe@example.com',
        description: 'Registered user email',
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'Str0ngP@ssw0rd!',
        description: 'User password',
      },
    },
  },
  AuthResponse: {
    type: 'object',
    required: ['user', 'token'],
    properties: {
      user: {
        $ref: '#/components/schemas/UserProfile',
      },
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Short-lived JSON Web Token for Bearer authentication',
      },
    },
  },
  TokenRefreshResponse: {
    type: 'object',
    required: ['token'],
    properties: {
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Newly issued access token',
      },
    },
  },
};
