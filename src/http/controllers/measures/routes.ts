import { FastifyInstance } from 'fastify'
import { create } from './create'
import { confirm } from './confirm-value'
import { list } from './get-measures'

export async function measureRoutes(app: FastifyInstance) {
  app.post('/upload', create)
  app.patch('/confirm', confirm)
  app.get('/:customer_code/list', list)
}
