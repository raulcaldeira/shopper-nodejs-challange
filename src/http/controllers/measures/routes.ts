import { FastifyInstance } from 'fastify'
import { create } from './create'
import { confirm } from './confirm-value'

export async function measureRoutes(app: FastifyInstance) {
  app.post('/upload', create)
  app.patch('/confirm', confirm)
}
