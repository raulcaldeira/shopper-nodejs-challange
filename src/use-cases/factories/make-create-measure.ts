import { CreateMeasureUseCase } from '@/use-cases/create-measure'
import { PrismaMeasuresRepository } from '../../repositories/prisma/prisma-measures-repository'

export function makeCreateMeasureUseCase() {
  const measureRepository = new PrismaMeasuresRepository()
  const createMeasureUseCase = new CreateMeasureUseCase(measureRepository)

  return createMeasureUseCase
}
