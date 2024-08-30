import { Measures, Prisma } from '@prisma/client'
import { MeasuresRepository } from '../measures-repository'
import { prisma } from '@/lib/prisma'

export class PrismaMeasuresRepository implements MeasuresRepository {
  async create(data: Prisma.MeasuresCreateInput) {
    const createdMeasure = await prisma.measures.create({ data })

    return createdMeasure
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
}
