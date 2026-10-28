export const authPaths = {
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user account',
      description:
        'Creates a new user profile with password encryption and returns the created user entity.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfile',
              },
            },
          },
        },
        400: {
          description: 'Validation error (invalid inputs or password under 8 characters)',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
            },
          },
        },
        409: {
          description: 'Email already registered',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        429: {
          description: 'Too many authentication attempts (Rate Limit exceeded)',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Authenticate user credentials',
      description:
        'Validates user email and password. On success, sets HttpOnly refreshToken cookie and returns access token + user details.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Authenticated successfully',
          headers: {
            'Set-Cookie': {
              description: 'HttpOnly secure refresh token cookie',
              schema: {
                type: 'string',
                example: 'refreshToken=eyJhbGciOi...; Path=/; HttpOnly; SameSite=Lax',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthResponse',
              },
            },
          },
        },
        400: {
          description: 'Validation error on credentials payload',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Invalid email or password',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        429: {
          description: 'Rate limit exceeded for authentication requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      description:
        'Issues a new short-lived JWT access token using the HttpOnly refreshToken cookie.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TokenRefreshResponse',
              },
            },
          },
        },
        401: {
          description: 'Missing, expired or revoked refresh token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout current user',
      description: 'Revokes the refresh token in database and clears authentication cookies.',
      responses: {
        204: {
          description: 'Logged out successfully, cookies cleared',
        },
      },
    },
  },
};
