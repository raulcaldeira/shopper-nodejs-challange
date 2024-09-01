import { MeasureAlreadyConfirmedError } from '@/use-cases/errors/measure-already-confirmed'
import { MeasureNotFoundError } from '@/use-cases/errors/measure-not-found'
import { makeConfirmMeasureUseCase } from '@/use-cases/factories/make-confirm-measure'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function confirm(request: FastifyRequest, reply: FastifyReply) {
  const confirmMeasureBodySchema = z.object({
    measure_uuid: z.string().uuid('O UUID fornecido não é válido'),
    confirmed_value: z
      .number()
      .int('O valor confirmado deve ser um número inteiro'),
  })

  try {
    const { measure_uuid, confirmed_value } = confirmMeasureBodySchema.parse(
      request.body,
    )

    const confirmMeasueUseCase = makeConfirmMeasureUseCase()

    const { isCorrectValue } = await confirmMeasueUseCase.execute({
      measure_uuid,
      confirmed_value,
    })

    return reply.status(200).send({ success: isCorrectValue })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = {
        error_code: 'INVALID_DATA',
        error_description: error.errors.map((err) => err.message).join(', '),
      }

      return reply.status(400).send(errorResponse)
    }

    if (error instanceof MeasureNotFoundError) {
      const errorResponse = {
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura não encontrada',
      }

      return reply.status(404).send(errorResponse)
    }

    if (error instanceof MeasureAlreadyConfirmedError) {
      const errorResponse = {
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada',
      }

      return reply.status(409).send(errorResponse)
    }

    console.error('Unexpected error:', error)
    const errorResponse = {
      error_code: 'INTERNAL_ERROR',
      error_description: 'An internal error occurred.',
    }
    return reply.status(500).send(errorResponse)
  }
}
