import { DoubleReportError } from '@/use-cases/errors/double-report'
import { makeCreateMeasureUseCase } from '@/use-cases/factories/make-create-measure'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
// import { makeCreateGymUseCase } from '@/use-cases/factories/make-create-gym-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createMeasureBodySchema = z.object({
    image: z.string().min(1, 'Image is required'),
    customer_code: z.string().min(1, 'Customer code is required'),
    measure_datetime: z
      .string()
      .min(1, 'Measure datetime is required')
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      }),
    measure_type: z.enum(['WATER', 'GAS']),
  })

  try {
    const { image, customer_code, measure_datetime, measure_type } =
      createMeasureBodySchema.parse(request.body)

    const createMeasureUseCase = makeCreateMeasureUseCase()

    const measureData = await createMeasureUseCase.execute({
      image,
      customer_code,
      measure_datetime: new Date(measure_datetime),
      measure_type,
    })

    return reply.status(200).send(measureData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formata a resposta para erros de validação
      const errorResponse = {
        error_code: 'INVALID_DATA',
        error_description: error.errors.map((err) => err.message).join(', '),
      }
      return reply.status(400).send(errorResponse)
    }

    if (error instanceof DoubleReportError) {
      return reply.status(400).send({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      })
    }

    // Em caso de outros erros inesperados
    console.error('Unexpected error:', error)
    const errorResponse = {
      error_code: 'INTERNAL_ERROR',
      error_description: 'An internal error occurred.',
    }
    return reply.status(500).send(errorResponse)
  }
}
