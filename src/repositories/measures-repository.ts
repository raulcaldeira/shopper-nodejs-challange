import { Measures, Prisma } from '@prisma/client'

export interface findByCustomerCodeResponse {
  measure_uuid: string
  measure_datetime: Date
  measure_type: string
  has_confirmed: boolean
  image_url: string
}

export interface MeasuresRepository {
  create(data: Prisma.MeasuresCreateInput): Promise<Measures>
  findById(id: string): Promise<Measures | null>
  findByCustomerCode(
    customer_code: string,
    measure_type: 'GAS' | 'WATER' | null,
  ): Promise<findByCustomerCodeResponse[] | null>
  findByCustomerCodeAndMonth(
    customer_code: string,
    measure_type: 'WATER' | 'GAS',
    measure_datetime: Date,
  ): Promise<Measures | null>
  findAllUserMeasures(customer_code: string): Promise<Measures[] | null>
  measureAlreadyConfirmed(id: string): Promise<boolean>
  insertAndValidateMeasureValue(
    id: string,
    confirmedValue: number,
  ): Promise<{ isSameValue: boolean }>
}
