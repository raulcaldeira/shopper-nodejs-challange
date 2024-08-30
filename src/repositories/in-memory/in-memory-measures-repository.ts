import { Measures, Prisma } from '@prisma/client'
import { MeasuresRepository } from '../measures-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryMeasuresRepository implements MeasuresRepository {
  public items: Measures[] = []

  async create(data: Prisma.MeasuresCreateInput) {
    const measure = {
      id: data.id ?? randomUUID(),
      customer_code: data.customer_code,
      measure_type: data.measure_type,
      image_url: data.image_url,
      recognized_value: data.recognized_value,
      confirmed_value: data.confirmed_value ?? null,
      created_at: new Date(),
    }

    this.items.push(measure)

    return measure
  }

  async findByCustomerCodeAndMonth(
    customer_code: string,
    measure_type: 'WATER' | 'GAS',
    measure_datetime: Date,
  ): Promise<Measures | null> {
    const startOfMonth = new Date(
      measure_datetime.getFullYear(),
      measure_datetime.getMonth(),
      1,
    )
    const endOfMonth = new Date(
      measure_datetime.getFullYear(),
      measure_datetime.getMonth() + 1,
      0,
    )

    return (
      this.items.find(
        (measure) =>
          measure.customer_code === customer_code &&
          measure.measure_type === measure_type &&
          measure.created_at >= startOfMonth &&
          measure.created_at <= endOfMonth,
      ) || null
    )
  }

  async findAllUserMeasures(customer_code: string): Promise<Measures[] | null> {
    const userMeasures = this.items.filter(
      (measure) => measure.customer_code === customer_code,
    )

    return userMeasures
  }
}
