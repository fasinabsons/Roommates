import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { cld } from '../lib/cloudinary'
import { AdvancedImage } from '@cloudinary/react'
import { auto } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'

export default function TestPage() {
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [cloudinaryReady, setCloudinaryReady] = useState(false)
  const [testing, setTesting] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      // Test Supabase
      try {
        const { error } = await supabase.from('apartments').select('count')
        setSupabaseConnected(!error)
      } catch (err) {
        console.error('Supabase test failed:', err)
        setSupabaseConnected(false)
      }

      // Test Cloudinary
      try {
        const img = cld.image('cld-sample-5')
        setCloudinaryReady(true)
      } catch (error) {
        console.error('Cloudinary test failed:', error)
        setCloudinaryReady(false)
      }

      setTesting(false)
    }

    runTests()
  }, [])

  const sampleImage = cld
    .image('cld-sample-5')
    .format('auto')
    .quality('auto')
    .resize(auto().gravity(autoGravity()).width(400).height(400))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="card max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient mb-3">ZiberLive</h1>
          <p className="text-lg text-gray-600">System Status Check</p>
        </div>

        {/* Status Cards */}
        <div className="space-y-4 mb-8">
          {/* Supabase Status */}
          <div
            className={`p-6 rounded-lg border-2 transition-all ${
              testing
                ? 'bg-gray-50 border-gray-200'
                : supabaseConnected
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Supabase Database</h3>
                <p className="text-sm text-gray-600">PostgreSQL Connection</p>
              </div>
              <div className="text-3xl">
                {testing ? (
                  <div className="spinner h-8 w-8"></div>
                ) : supabaseConnected ? (
                  '✅'
                ) : (
                  '❌'
                )}
              </div>
            </div>
            {!testing && (
              <p
                className={`mt-3 text-sm font-medium ${
                  supabaseConnected ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {supabaseConnected
                  ? 'Connected successfully!'
                  : 'Connection failed - Check credentials'}
              </p>
            )}
          </div>

          {/* Cloudinary Status */}
          <div
            className={`p-6 rounded-lg border-2 transition-all ${
              testing
                ? 'bg-gray-50 border-gray-200'
                : cloudinaryReady
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Cloudinary CDN</h3>
                <p className="text-sm text-gray-600">Image Storage & Delivery</p>
              </div>
              <div className="text-3xl">
                {testing ? (
                  <div className="spinner h-8 w-8"></div>
                ) : cloudinaryReady ? (
                  '✅'
                ) : (
                  '❌'
                )}
              </div>
            </div>
            {!testing && (
              <p
                className={`mt-3 text-sm font-medium ${
                  cloudinaryReady ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {cloudinaryReady
                  ? 'Ready to use!'
                  : 'Not configured - Check cloud name'}
              </p>
            )}
          </div>
        </div>

        {/* Sample Image */}
        {cloudinaryReady && !testing && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4 font-medium">
              Sample Cloudinary Image:
            </p>
            <div className="inline-block rounded-lg overflow-hidden shadow-lg">
              <AdvancedImage cldImg={sampleImage} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <button onClick={() => window.location.reload()} className="btn-primary">
            🔄 Refresh Test
          </button>
          {supabaseConnected && cloudinaryReady && (
            <button
              onClick={() => (window.location.href = '/login')}
              className="btn-success"
            >
              ✅ Start Building
            </button>
          )}
        </div>

        {/* Environment Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Environment: {import.meta.env.VITE_APP_ENV || 'development'} •
            Version: 1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}

