import React from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

export default function ExpiredLiabilityForm({ message }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <ExclamationCircleIcon className="mx-auto h-16 w-16 text-red-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Link Expired
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {message || 'This liability form link has expired or is invalid.'}
                        </p>
                        
                        <div className="mt-8 p-4 bg-yellow-50 rounded-md">
                            <h3 className="text-sm font-medium text-yellow-800">
                                What to do next:
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Contact your administrator for a new form link</li>
                                    <li>Verify you're using the correct link provided</li>
                                    <li>Check if the link was sent recently (links expire after 7 days)</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
