import { describe, it, beforeEach, expect, vi, afterEach } from 'vitest'
import { InMemoryMeasuresRepository } from '@/repositories/in-memory/in-memory-measures-repository'
import { ConfirmMeasureUseCase } from '../confirm-measure'
import { MeasureAlreadyConfirmedError } from '../errors/measure-already-confirmed'
import { MeasureNotFoundError } from '../errors/measure-not-found'

let measuresRepository: InMemoryMeasuresRepository
let sut: ConfirmMeasureUseCase

describe('CreateMeasureUseCase', () => {
  beforeEach(() => {
    measuresRepository = new InMemoryMeasuresRepository()
    sut = new ConfirmMeasureUseCase(measuresRepository)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // Inserir valor igual
  it('should to confirm correct value', async () => {
    const createdMeasure = await measuresRepository.create({
      customer_code: 'CUST12345',
      measure_type: 'WATER',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
      confirmed_value: null,
      created_at: new Date('2024-08-15T10:00:00Z'),
    })

    const data = await sut.execute({
      measure_uuid: createdMeasure.id,
      confirmed_value: 123,
    })

    expect(data.isCorrectValue).toEqual(true)
  })

  // Inserir valor diferente
  it('should to confirm incorrect value', async () => {
    const createdMeasure = await measuresRepository.create({
      customer_code: 'CUST12345',
      measure_type: 'WATER',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
      confirmed_value: null,
      created_at: new Date('2024-08-15T10:00:00Z'),
    })

    const data = await sut.execute({
      measure_uuid: createdMeasure.id,
      confirmed_value: 50,
    })

    expect(data.isCorrectValue).toEqual(false)
  })

  // Leitura já confirmada
  it('not should to confirm a confirmed measure', async () => {
    const createdMeasure = await measuresRepository.create({
      customer_code: 'CUST12345',
      measure_type: 'WATER',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
      confirmed_value: 123,
      created_at: new Date('2024-08-15T10:00:00Z'),
    })

    await expect(
      sut.execute({
        measure_uuid: createdMeasure.id,
        confirmed_value: 50,
      }),
    ).rejects.toBeInstanceOf(MeasureAlreadyConfirmedError)
  })

  // Não encontrar id
  it('not should to confirm a non-existent measure', async () => {
    await expect(
      sut.execute({
        measure_uuid: 'non-existing-measure',
        confirmed_value: 50,
      }),
    ).rejects.toBeInstanceOf(MeasureNotFoundError)
  })
})
