import { env } from '@/env'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { randomUUID } from 'node:crypto'
import * as fs from 'fs'
import path from 'path'

interface responseInterface {
  image_url: string
  measure_value: number
}

export async function fetchMeasurementFromGemini(
  base64Image: string,
  measureType: 'WATER' | 'GAS',
): Promise<responseInterface> {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  })

  const matches = base64Image.match(/^data:(.+);base64,(.+)$/)
  if (matches?.length !== 3)
    // throw new BadRequestException('Invalid base64 string.');
    throw new Error('Invalid base64 string.')

  const contentType = matches[1]
  const base64Data = matches[2]
  const fileExtension = contentType.split('/')[1].toLowerCase()
  const fileName = `${randomUUID()}-${measureType.toLowerCase()}-meter.${fileExtension}`

  const filePath = path.join(__dirname, fileName)

  try {
    const buffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(filePath, buffer)
  } catch (err) {
    console.error('Error writing the file:', err)
    throw new Error('Failed to write the image file.')
  }

  const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY)

  const uploadResponse = await fileManager.uploadFile(filePath, {
    mimeType: contentType,
  })

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    {
      text: `Extract the measurement value from a ${measureType} meter.`,
    },
  ])

  const generatedText = result.response.text()

  // View the response.
  console.log(generatedText)

  fs.unlinkSync(filePath)

  const matchResult = generatedText.match(/\d+(\.\d+)?/)
  const measureValue = matchResult ? parseFloat(matchResult[0]) : NaN

  console.log(measureValue)

  const responseData = {
    image_url: uploadResponse.file.uri,
    measure_value: measureValue,
  }

  return responseData
}
