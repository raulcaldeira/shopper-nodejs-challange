import { MeasureNotFoundError } from '@/use-cases/errors/measure-not-found'
import { makeGetMeasuresUseCase } from '@/use-cases/factories/make-get-measures'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const routeSchema = z.object({
    customer_code: z.string(),
  })

  const querySchema = z.object({
    measure_type: z
      .string()
      .optional()
      .transform(
        (value) => value?.trim().toUpperCase() as 'WATER' | 'GAS' | undefined,
      )
      .refine(
        (value) =>
          ['WATER', 'GAS', undefined].includes(
            value as 'WATER' | 'GAS' | undefined,
          ),
        {
          message: 'Tipo de medição não permitida',
        },
      ),
  })

  const { customer_code } = routeSchema.parse(request.params)

  const parsedQuery = querySchema.safeParse(request.query)

  if (!parsedQuery.success) {
    return reply.status(400).send({
      error_code: 'INVALID_TYPE',
      error_description: 'Tipo de medição não permitida',
    })
  }

  const { measure_type } = parsedQuery.data

  try {
    const getMeasureUseCase = makeGetMeasuresUseCase()

    const { measures } = await getMeasureUseCase.execute({
      customer_code,
      measure_type: measure_type || null,
    })

    return reply.status(200).send({ customer_code, measures })
  } catch (error) {
    if (error instanceof MeasureNotFoundError) {
      const errorResponse = {
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      }

      return reply.status(404).send(errorResponse)
    }

    if (error instanceof z.ZodError) {
      const errorResponse = {
        error_code: 'INVALID_DATA',
        error_description: error.errors.map((err) => err.message).join(', '),
      }

      return reply.status(400).send(errorResponse)
    }

    console.error('Unexpected error:', error)
    const errorResponse = {
      error_code: 'INTERNAL_ERROR',
      error_description: 'An internal error occurred.',
    }
    return reply.status(500).send(errorResponse)
  }
}
