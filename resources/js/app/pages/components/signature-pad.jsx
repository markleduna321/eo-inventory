import React, { useRef, useEffect, useState } from 'react'
import Button from './button'

const SignaturePad = ({ onSignatureChange, disabled = false, className = '' }) => {
    const canvasRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        
        // Set canvas size
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        ctx.scale(2, 2)
        
        // Set drawing properties
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, [])

    const getCoordinates = (e) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        
        if (e.touches && e.touches[0]) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            }
        }
        
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    const startDrawing = (e) => {
        if (disabled) return
        
        e.preventDefault()
        setIsDrawing(true)
        
        const { x, y } = getCoordinates(e)
        const ctx = canvasRef.current.getContext('2d')
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e) => {
        if (!isDrawing || disabled) return
        
        e.preventDefault()
        const { x, y } = getCoordinates(e)
        const ctx = canvasRef.current.getContext('2d')
        ctx.lineTo(x, y)
        ctx.stroke()
        
        setHasSignature(true)
    }

    const stopDrawing = (e) => {
        if (!isDrawing) return
        
        e.preventDefault()
        setIsDrawing(false)
        
        // Convert to base64 and notify parent
        if (hasSignature) {
            const canvas = canvasRef.current
            const dataURL = canvas.toDataURL('image/png')
            const base64Data = dataURL.split(',')[1]
            onSignatureChange(base64Data)
        }
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        // Clear and fill with white
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        setHasSignature(false)
        onSignatureChange('')
    }

    return (
        <div className={`signature-pad ${className}`}>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                <canvas
                    ref={canvasRef}
                    className="w-full h-32 border border-gray-200 rounded cursor-crosshair"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                
                <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-600">
                        {hasSignature ? 'Signature captured' : 'Sign above with your mouse or finger'}
                    </p>
                    
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={clearSignature}
                        disabled={disabled || !hasSignature}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SignaturePad
