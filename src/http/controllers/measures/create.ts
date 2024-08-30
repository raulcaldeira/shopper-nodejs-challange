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

  const { image, customer_code, measure_datetime, measure_type } =
    createMeasureBodySchema.parse(request.body)

  const createMeasureUseCase = makeCreateMeasureUseCase()

  await createMeasureUseCase.execute({
    image,
    customer_code,
    measure_datetime: new Date(measure_datetime),
    measure_type,
  })

  return reply.status(201).send()
}
