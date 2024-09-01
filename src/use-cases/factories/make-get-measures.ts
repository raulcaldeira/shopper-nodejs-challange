import { PrismaMeasuresRepository } from '../../repositories/prisma/prisma-measures-repository'
import { GetMeasuresUseCase } from '../get-measures'

export function makeGetMeasuresUseCase() {
  const measureRepository = new PrismaMeasuresRepository()
  const getMeasureUseCase = new GetMeasuresUseCase(measureRepository)

  return getMeasureUseCase
}
