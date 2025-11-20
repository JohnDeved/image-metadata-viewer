export const downloadJSON = (data: unknown) => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exif-data.json'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
    alert('Failed to create JSON download')
  }
}
