import { describe, it, beforeEach, expect } from 'vitest'
import { InMemoryMeasuresRepository } from '@/repositories/in-memory/in-memory-measures-repository'
import { GetMeasuresUseCase } from '../get-measures'
import { MeasureNotFoundError } from '../errors/measure-not-found'

let measuresRepository: InMemoryMeasuresRepository
let sut: GetMeasuresUseCase

describe('CreateMeasureUseCase', () => {
  beforeEach(() => {
    measuresRepository = new InMemoryMeasuresRepository()
    sut = new GetMeasuresUseCase(measuresRepository)
  })

  // Trazer lista de measures de um usuário
  it('should get a list of all measures of a user', async () => {
    await measuresRepository.create({
      customer_code: 'CUST12345',
      measure_type: 'WATER',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
    })

    await measuresRepository.create({
      customer_code: 'CUST12345',
      measure_type: 'GAS',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
    })

    const data = await sut.execute({
      customer_code: 'CUST12345',
    })

    expect(data.measures).toHaveLength(2)
    expect(data.measures[0].measure_type).toEqual('WATER')
    expect(data.measures[1].measure_type).toEqual('GAS')
  })

  // Retornar erro caso não encontre measures para o customer_code fornecido
  it('not should list measures for inexisting customer code', async () => {
    await expect(
      sut.execute({
        customer_code: 'CUST12345',
      }),
    ).rejects.toBeInstanceOf(MeasureNotFoundError)
  })

  // Trazer medidas de apenas um tipo
  it('should get a list of all measures of a user filtered by measure type', async () => {
    await measuresRepository.create({
      customer_code: 'CUST12345',
      measure_type: 'WATER',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
    })

    await measuresRepository.create({
      customer_code: 'CUST12345',
      measure_type: 'GAS',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
    })

    const data = await sut.execute({
      customer_code: 'CUST12345',
      measure_type: 'GAS',
    })

    expect(data.measures).toHaveLength(1)
    expect(data.measures[0].measure_type).toEqual('GAS')
  })
})
