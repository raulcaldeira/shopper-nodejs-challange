import { MeasuresRepository } from '../repositories/measures-repository'
import { MeasureNotFoundError } from './errors/measure-not-found'

interface GetMeasuresUseCaseRequest {
  customer_code: string
  measure_type?: 'GAS' | 'WATER' | null
}

type Measure = {
  measure_uuid: string
  measure_datetime: Date
  measure_type: string
  has_confirmed: boolean
  image_url: string
}

interface GetMeasuresUseCaseResponse {
  measures: Measure[]
}

export class GetMeasuresUseCase {
  constructor(private measuresRepository: MeasuresRepository) {}

  async execute({
    customer_code,
    measure_type = null,
  }: GetMeasuresUseCaseRequest): Promise<GetMeasuresUseCaseResponse> {
    const measures = await this.measuresRepository.findByCustomerCode(
      customer_code,
      measure_type,
    )

    if (measures?.length === 0 || !measures) {
      throw new MeasureNotFoundError()
    }

    return {
      measures,
    }
  }
}
