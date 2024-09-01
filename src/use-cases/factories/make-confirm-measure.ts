import { PrismaMeasuresRepository } from '../../repositories/prisma/prisma-measures-repository'
import { ConfirmMeasureUseCase } from '../confirm-measure'

export function makeConfirmMeasureUseCase() {
  const measureRepository = new PrismaMeasuresRepository()
  const confirmMeasureUseCase = new ConfirmMeasureUseCase(measureRepository)

  return confirmMeasureUseCase
}
