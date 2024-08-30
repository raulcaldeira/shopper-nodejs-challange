export function validateBase64Image(base64: string): boolean {
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/

  if (!base64Regex.test(base64)) {
    return false
  }

  const base64Data = base64.replace(
    /^data:image\/(jpeg|jpg|png|gif);base64,/,
    '',
  )
  if (base64Data.length === 0) {
    return false
  }

  return true
}
