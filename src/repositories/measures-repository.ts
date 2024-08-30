import { Measures, Prisma } from '@prisma/client'

export interface MeasuresRepository {
  create(data: Prisma.MeasuresCreateInput): Promise<Measures>
  findByCustomerCodeAndMonth(
    customer_code: string,
    measure_type: 'WATER' | 'GAS',
    measure_datetime: Date,
  ): Promise<Measures | null>
}
