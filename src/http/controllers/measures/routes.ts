import { FastifyInstance } from 'fastify'
import { create } from './create'

export async function measureRoutes(app: FastifyInstance) {
  app.post('/upload', create)
}
