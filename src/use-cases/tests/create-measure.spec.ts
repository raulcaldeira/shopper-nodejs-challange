import { CreateMeasureUseCase } from '../create-measure'
import { describe, it, beforeEach, expect, vi, afterEach } from 'vitest'
import { InMemoryMeasuresRepository } from '@/repositories/in-memory/in-memory-measures-repository'
import { join } from 'path'
import { readFileSync } from 'fs'

// Mock da função fetchMeasurementFromGemini
import { fetchMeasurementFromGemini } from '@/services/gemini/fetchMeasurementFromGemini'
import { DoubleReportError } from '../errors/double-report'
vi.mock('@/services/gemini/fetchMeasurementFromGemini', () => ({
  fetchMeasurementFromGemini: vi.fn(),
}))

const base64FilePath = join(__dirname, 'fixtures', 'base64-meter.txt')
const base64Image = readFileSync(base64FilePath, 'utf8')

let measuresRepository: InMemoryMeasuresRepository
let sut: CreateMeasureUseCase

describe('CreateMeasureUseCase', () => {
  beforeEach(() => {
    measuresRepository = new InMemoryMeasuresRepository()
    sut = new CreateMeasureUseCase(measuresRepository)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should upload gas meter image and create measure', async () => {
    vi.mocked(fetchMeasurementFromGemini).mockResolvedValue({
      image_url: 'http://example.com/image.jpg',
      measure_value: 123,
    })

    const measure = await sut.execute({
      image: base64Image,
      customer_code: 'CUST12346',
      measure_datetime: new Date('2024-08-30T10:00:00Z'),
      measure_type: 'GAS',
    })

    expect(measure).toBeDefined()
    expect(measure).toHaveProperty('image_url')
    expect(measure).toHaveProperty('measure_value')
    expect(measure).toHaveProperty('measure_uuid')

    expect(measure.image_url).toBeTruthy()
    expect(typeof measure.image_url).toBe('string')
    expect(measure.measure_value).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(measure.measure_value)).toBe(true)
    expect(measure.measure_uuid).toBeTruthy()
    expect(typeof measure.measure_uuid).toBe('string')

    expect(fetchMeasurementFromGemini).toHaveBeenCalledWith(base64Image, 'GAS')
    expect(fetchMeasurementFromGemini).toHaveBeenCalledTimes(1)
  })

  it('should upload gas and water meter in same month', async () => {
    vi.mocked(fetchMeasurementFromGemini).mockResolvedValue({
      image_url: 'http://example.com/image.jpg',
      measure_value: 123,
    })

    vi.setSystemTime(new Date('2024-08-10T10:00:00Z'))

    await measuresRepository.create({
      customer_code: 'CUST12346',
      measure_type: 'WATER',
      image_url: 'http://example.com/image.jpg',
      recognized_value: 123,
      confirmed_value: null,
    })

    vi.setSystemTime(new Date('2024-08-15T10:00:00Z'))

    await sut.execute({
      image: base64Image,
      customer_code: 'CUST12346',
      measure_datetime: new Date(),
      measure_type: 'GAS',
    })

    const allMeasures =
      await measuresRepository.findAllUserMeasures('CUST12346')

    expect(allMeasures).not.toBeNull()
    expect(allMeasures).toBeDefined()
    if (allMeasures) {
      expect(allMeasures).toHaveLength(2)
      expect(allMeasures[0]).toHaveProperty('measure_type', 'WATER')
      expect(allMeasures[1]).toHaveProperty('measure_type', 'GAS')
    }
  })

  it('not should upload meter twice a month', async () => {
    vi.mocked(fetchMeasurementFromGemini).mockResolvedValue({
      image_url: 'http://example.com/image.jpg',
      measure_value: 123,
    })

    vi.setSystemTime(new Date('2024-08-10T10:00:00Z'))

    await sut.execute({
      image: base64Image,
      customer_code: 'CUST12346',
      measure_datetime: new Date(),
      measure_type: 'GAS',
    })

    vi.setSystemTime(new Date('2024-08-15T10:00:00Z'))

    await expect(() =>
      sut.execute({
        image: base64Image,
        customer_code: 'CUST12346',
        measure_datetime: new Date(),
        measure_type: 'GAS',
      }),
    ).rejects.toThrow(DoubleReportError)
  })

  it('should throw an error if base64 image is invalid', async () => {
    vi.mocked(fetchMeasurementFromGemini).mockImplementation(() => {
      throw new Error('Invalid base64 string.')
    })

    vi.setSystemTime(new Date('2024-08-15T10:00:00Z'))

    // Espera que a exceção seja lançada
    await expect(() =>
      sut.execute({
        image: 'invalid_base64_image',
        customer_code: 'CUST12346',
        measure_datetime: new Date(),
        measure_type: 'GAS',
      }),
    ).rejects.toThrow('Invalid base64 string.')
  })
})
