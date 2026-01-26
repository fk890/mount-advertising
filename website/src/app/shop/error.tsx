'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Homepage error:', error)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong!</h3>          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              We apologize for the inconvenience. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2 text-xs text-red-600">
                <summary className="cursor-pointer">Error Details (Dev Mode)</summary>
                <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
