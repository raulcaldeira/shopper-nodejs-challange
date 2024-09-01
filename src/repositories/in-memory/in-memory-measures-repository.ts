import { Measures, Prisma } from '@prisma/client'
import {
  findByCustomerCodeResponse,
  MeasuresRepository,
} from '../measures-repository'
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

  async findById(id: string): Promise<Measures | null> {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findByCustomerCode(
    customer_code: string,
    measure_type: 'GAS' | 'WATER' | null,
  ): Promise<findByCustomerCodeResponse[] | null> {
    let filteredMeasures = this.items.filter(
      (measure) => measure.customer_code === customer_code,
    )

    if (measure_type) {
      filteredMeasures = filteredMeasures.filter(
        (measure) => measure.measure_type === measure_type,
      )
    }

    if (filteredMeasures.length === 0) {
      return null
    }

    return filteredMeasures.map((measure) => ({
      measure_uuid: measure.id,
      measure_datetime: measure.created_at,
      measure_type: measure.measure_type,
      has_confirmed: measure.recognized_value === measure.confirmed_value,
      image_url: measure.image_url,
    }))
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

  async measureAlreadyConfirmed(id: string): Promise<boolean> {
    const measure = this.items.find((item) => item.id === id)

    if (measure?.confirmed_value) {
      return true
    }

    return false
  }

  async insertAndValidateMeasureValue(
    id: string,
    confirmedValue: number,
  ): Promise<{ isSameValue: boolean }> {
    const measure = this.items.find((item) => item.id === id)

    if (measure) {
      measure.confirmed_value = confirmedValue
    }

    if (measure?.recognized_value === measure?.confirmed_value) {
      return { isSameValue: true }
    } else {
      return { isSameValue: false }
    }
  }
}
