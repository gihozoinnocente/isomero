const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Hub API',
      version: '1.0.0',
      description: 'A RESTful API for book discovery, management, and user interactions',
      contact: {
        name: 'Book Hub Team',
        email: 'api@bookhub.com',
        url: 'https://github.com/book-hub/api'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: process.env.PROD_URL || 'https://api.bookhub.com',
        description: 'Production server'
      }
    ],
    externalDocs: {
      description: 'Find out more about Book Hub',
      url: 'https://bookhub.com/docs'
    },
    tags: [
      { name: 'Books', description: 'Book-related operations' },
      { name: 'Authors', description: 'Author-related operations' },
      { name: 'Genres', description: 'Genre-related operations' },
      { name: 'Users', description: 'User authentication and management' },
      { name: 'Auth', description: 'Authentication operations' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        apiKey: {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
          description: 'API Key authentication'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Unauthorized'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Input validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Validation failed'
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
