import { fetchMeasurementFromGemini } from '@/services/gemini/fetchMeasurementFromGemini'
import { MeasuresRepository } from '../repositories/measures-repository'
import { validateBase64Image } from '@/utils/validate-base64'
import { DoubleReportError } from './errors/double-report'

interface CreateMeasureRequest {
  image: string
  customer_code: string
  measure_datetime: Date
  measure_type: 'WATER' | 'GAS'
}

interface CreateMeasureResponse {
  image_url: string
  measure_value: number
  measure_uuid: string
}

export class CreateMeasureUseCase {
  constructor(private measuresRepository: MeasuresRepository) {}

  async execute({
    image,
    customer_code,
    measure_datetime,
    measure_type,
  }: CreateMeasureRequest): Promise<CreateMeasureResponse> {
    // Validação da imagem base64
    if (!validateBase64Image(image)) {
      throw new Error('Invalid base64 image')
    }

    const measureDateTime = measure_datetime // new Date(measure_datetime)

    // Verificar se já existe uma leitura no mês para o tipo de medição
    const existingMeasure =
      await this.measuresRepository.findByCustomerCodeAndMonth(
        customer_code,
        measure_type,
        measureDateTime,
      )

    if (existingMeasure) {
      throw new DoubleReportError()
    }

    // Integrar com o Google Gemini para obter a medida
    const { image_url, measure_value } = await fetchMeasurementFromGemini(
      image,
      measure_type,
    )

    // Criar nova medição no repositório
    const newMeasure = await this.measuresRepository.create({
      customer_code,
      measure_type,
      image_url,
      recognized_value: measure_value,
      confirmed_value: null, // Valor será confirmado mais tarde
      created_at: new Date(),
    })

    return {
      image_url: newMeasure.image_url,
      measure_value: newMeasure.recognized_value,
      measure_uuid: newMeasure.id,
    }
  }
}
