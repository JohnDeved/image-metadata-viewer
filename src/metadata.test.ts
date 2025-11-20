import { describe, it, expect } from 'vitest'
import ExifReader from 'exifreader'
import fs from 'fs'
import path from 'path'

const TEST_IMAGES_DIR = path.join(process.cwd(), 'public/test')

describe('Metadata Extraction', () => {
  const files = fs.readdirSync(TEST_IMAGES_DIR).filter(file => /\.(jpg|jpeg|tiff|png)$/i.test(file))

  files.forEach(file => {
    it(`should extract metadata from ${file}`, async () => {
      const filePath = path.join(TEST_IMAGES_DIR, file)
      const fileBuffer = fs.readFileSync(filePath)
      const tags = await ExifReader.load(fileBuffer)

      console.log(`\n--- Metadata for ${file} ---`)
      // Log interesting tags to help decide what to add to the viewer
      const interestingTags = [
        'Make',
        'Model',
        'LensModel',
        'FNumber',
        'ExposureTime',
        'ISOSpeedRatings',
        'FocalLength',
        'DateTimeOriginal',
        'Software',
        'Artist',
        'Copyright',
        'ExposureProgram',
        'GPSAltitude',
        'CreatorTool',
        'ModifyDate',
        'MetadataDate',
        'CreateDate',
        'Instructions',
        'Headline',
        'Credit',
        'Source',
        'Title',
      ]

      interestingTags.forEach(tag => {
        if (tags[tag]) {
          console.log(`${tag}:`, tags[tag])
        }
      })

      if (tags.rights) console.log('rights:', tags.rights)

      // Also log raw keys to see what else is available
      console.log(
        'Available Keys:',
        Object.keys(tags).filter(k => !k.includes('Thumbnail') && !k.includes('MakerNote'))
      )

      expect(tags).toBeDefined()
      // Basic assertion to ensure we got something
      expect(Object.keys(tags).length).toBeGreaterThan(0)
    })
  })
})
