import { Cloudinary } from '@cloudinary/url-gen'
import { auto } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME!

if (!cloudName) {
  throw new Error('Missing Cloudinary cloud name. Please check your .env file.')
}

// Initialize Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName
  }
})

// Upload presets
export const UPLOAD_PRESETS = {
  PROFILES: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_PROFILES || 'ziberlive_profiles',
  DOCUMENTS: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS || 'ziberlive_documents',
  RECEIPTS: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_RECEIPTS || 'ziberlive_receipts',
}

export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
}

// Upload helper function
export const uploadToCloudinary = async (
  file: File,
  preset: keyof typeof UPLOAD_PRESETS,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESETS[preset])
  formData.append('cloud_name', cloudName)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    xhr.send(formData)
  })
}

// Get optimized image URL
export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number) => {
  const img = cld.image(publicId)
    .format('auto')
    .quality('auto')

  if (width && height) {
    img.resize(auto().gravity(autoGravity()).width(width).height(height))
  }

  return img.toURL()
}

// Get profile image with face detection
export const getProfileImageUrl = (publicId: string, size: number = 300) => {
  return cld.image(publicId)
    .format('auto')
    .quality('auto')
    .resize(auto().gravity(autoGravity()).width(size).height(size))
    .toURL()
}

