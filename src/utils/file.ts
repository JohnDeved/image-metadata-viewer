/**
 * Downloads data as a JSON file by creating a temporary blob URL
 * and triggering a download via a temporary anchor element.
 * @param data - The data to download as JSON
 */
export const downloadJSON = (data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'exif-data.json'
  a.click()
  URL.revokeObjectURL(url)
}
