import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Service Orders API',
    version: '1.0.0',
    description: 'API for managing service orders and technicians'
  },
  servers: [
    {
      url: 'http://localhost:3333/api'
    }
  ]
}

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts']
})

export { swaggerSpec }
