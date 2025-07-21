import React, { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline'

const QrScanner = ({ isOpen, onClose, onScan }) => {
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState('')
    const videoRef = useRef(null)
    const readerRef = useRef(null)

    useEffect(() => {
        if (isOpen && !readerRef.current) {
            readerRef.current = new BrowserMultiFormatReader()
        }

        return () => {
            if (readerRef.current) {
                readerRef.current.reset()
            }
        }
    }, [isOpen])

    const startScanning = async () => {
        try {
            setError('')
            setIsScanning(true)

            if (readerRef.current && videoRef.current) {
                await readerRef.current.decodeFromVideoDevice(
                    undefined, // Use default camera
                    videoRef.current,
                    (result, error) => {
                        if (result) {
                            const text = result.getText()
                            // Check if it's a system unit QR code URL
                            if (text.includes('/system-units/qr/')) {
                                const qrCode = text.split('/system-units/qr/')[1]
                                onScan(qrCode)
                                stopScanning()
                            } else {
                                setError('This QR code is not a valid system unit QR code.')
                            }
                        }
                    }
                )
            }
        } catch (err) {
            setError('Failed to start camera. Please check permissions.')
            setIsScanning(false)
        }
    }

    const stopScanning = () => {
        if (readerRef.current) {
            readerRef.current.reset()
        }
        setIsScanning(false)
    }

    const handleClose = () => {
        stopScanning()
        setError('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <CameraIcon className="h-5 w-5 mr-2" />
                            Scan System Unit QR Code
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Camera View */}
                            <div className="relative bg-black rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    className="w-full h-64 object-cover"
                                    style={{ display: isScanning ? 'block' : 'none' }}
                                />
                                {!isScanning && (
                                    <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                                        <div className="text-center">
                                            <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">Camera will appear here</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-700">
                                    Point your camera at a system unit QR code to scan and view its details.
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex justify-between space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                                <div className="flex space-x-2">
                                    {isScanning ? (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="md"
                                            onClick={stopScanning}
                                        >
                                            Stop Scanning
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="md"
                                            onClick={startScanning}
                                        >
                                            Start Scanning
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default QrScanner
