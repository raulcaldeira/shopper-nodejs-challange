import { MeasuresRepository } from '../repositories/measures-repository'
import { MeasureAlreadyConfirmedError } from './errors/measure-already-confirmed'
import { MeasureNotFoundError } from './errors/measure-not-found'

interface ConfirmMeasureRequest {
  measure_uuid: string
  confirmed_value: number
}

interface ConfirmMeasureResponse {
  isCorrectValue: boolean
}

export class ConfirmMeasureUseCase {
  constructor(private measuresRepository: MeasuresRepository) {}

  async execute({
    measure_uuid,
    confirmed_value,
  }: ConfirmMeasureRequest): Promise<ConfirmMeasureResponse> {
    const measure = await this.measuresRepository.findById(measure_uuid)

    if (!measure) {
      throw new MeasureNotFoundError()
    }

    const isMeasureConfirmed =
      await this.measuresRepository.measureAlreadyConfirmed(measure_uuid)

    if (isMeasureConfirmed) {
      throw new MeasureAlreadyConfirmedError()
    }

    const updateResponse =
      await this.measuresRepository.insertAndValidateMeasureValue(
        measure_uuid,
        confirmed_value,
      )

    return {
      isCorrectValue: updateResponse.isSameValue,
    }
  }
}
