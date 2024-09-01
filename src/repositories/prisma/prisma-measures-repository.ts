import { Measures, Prisma } from '@prisma/client'
import {
  findByCustomerCodeResponse,
  MeasuresRepository,
} from '../measures-repository'
import { prisma } from '@/lib/prisma'

export class PrismaMeasuresRepository implements MeasuresRepository {
  async create(data: Prisma.MeasuresCreateInput) {
    const createdMeasure = await prisma.measures.create({ data })

    return createdMeasure
  }

  async findById(id: string): Promise<Measures | null> {
    const measure = await prisma.measures.findUnique({ where: { id } })

    return measure
  }

  async findByCustomerCode(
    customer_code: string,
    measure_type: 'GAS' | 'WATER' | null,
  ): Promise<findByCustomerCodeResponse[] | null> {
    const whereConditions: Prisma.MeasuresWhereInput = {
      customer_code,
      ...(measure_type ? { measure_type } : {}),
    }

    const measures = await prisma.measures.findMany({
      where: whereConditions,
    })

    if (measures.length === 0) {
      return null
    }

    return measures.map((measure) => ({
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
    // Obter o primeiro dia do mês
    const startOfMonth = new Date(
      measure_datetime.getFullYear(),
      measure_datetime.getMonth(),
      1,
    )

    // Obter o último dia do mês
    const endOfMonth = new Date(
      measure_datetime.getFullYear(),
      measure_datetime.getMonth() + 1,
      0,
    )

    return prisma.measures.findFirst({
      where: {
        customer_code,
        measure_type,
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })
  }

  async findAllUserMeasures(customer_code: string): Promise<Measures[] | null> {
    const userMeasures = prisma.measures.findMany({
      where: {
        customer_code,
      },
    })

    return userMeasures
  }

  async measureAlreadyConfirmed(id: string): Promise<boolean> {
    const measure = await prisma.measures.findUnique({ where: { id } })

    if (measure?.confirmed_value) {
      return true
    }

    return false
  }

  async insertAndValidateMeasureValue(
    id: string,
    confirmedValue: number,
  ): Promise<{ isSameValue: boolean }> {
    const measure = await prisma.measures.update({
      where: {
        id,
      },
      data: {
        confirmed_value: confirmedValue,
      },
    })

    if (measure.recognized_value === measure.confirmed_value) {
      return { isSameValue: true }
    } else {
      return { isSameValue: false }
    }
  }
}
