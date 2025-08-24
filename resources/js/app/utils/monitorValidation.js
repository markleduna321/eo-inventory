/**
 * Monitor Form Validation Utilities
 * Contains validation rules and helper functions for monitor forms
 */

export const monitorValidationRules = {
    serial_number: {
        required: true,
        minLength: 3,
        maxLength: 255,
        pattern: /^[A-Za-z0-9\-_\/]+$/,
        message: 'Serial number must be 3-255 characters, alphanumeric with hyphens, underscores, or slashes only'
    },
    brand: {
        required: true,
        minLength: 2,
        maxLength: 255,
        message: 'Brand must be 2-255 characters long'
    },
    model: {
        required: true,
        minLength: 1,
        maxLength: 255,
        message: 'Model must be 1-255 characters long'
    },
    size: {
        required: true,
        pattern: /^\d+$/,
        min: 10,
        max: 100,
        message: 'Size must be a number between 10 and 100 inches'
    },
    resolution: {
        required: true,
        pattern: /^\d+x\d+$/,
        message: 'Resolution must be in format "1920x1080"'
    },
    refresh_rate: {
        required: false,
        pattern: /^\d+$/,
        min: 30,
        max: 500,
        message: 'Refresh rate must be a number between 30 and 500 Hz'
    },
    status: {
        required: true,
        options: ['working', 'not_working', 'under_repair', 'retired'],
        message: 'Please select a valid status'
    },
    location: {
        required: true,
        minLength: 1,
        maxLength: 255,
        message: 'Location is required and must be less than 255 characters'
    },
    received_by: {
        required: true,
        minLength: 2,
        maxLength: 255,
        pattern: /^[A-Za-z\s\.\-]+$/,
        message: 'Received by must be 2-255 characters, letters, spaces, dots, and hyphens only'
    },
    notes: {
        required: false,
        maxLength: 1000,
        message: 'Notes must be less than 1000 characters'
    },
    price: {
        required: false,
        pattern: /^\d+(\.\d{1,2})?$/,
        min: 0,
        max: 999999.99,
        message: 'Price must be a valid amount (max 999,999.99)'
    }
}

/**
 * Validate a single field
 * @param {string} fieldName - The field name to validate
 * @param {string} value - The value to validate
 * @param {Object} formData - The complete form data for cross-field validation
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (fieldName, value, formData = {}) => {
    const rules = monitorValidationRules[fieldName]
    if (!rules) return null

    // Check if field is required
    if (rules.required && (!value || value.toString().trim() === '')) {
        return `${formatFieldName(fieldName)} is required`
    }

    // If field is not required and empty, skip other validations
    if (!rules.required && (!value || value.toString().trim() === '')) {
        return null
    }

    const strValue = value.toString().trim()

    // Check minimum length
    if (rules.minLength && strValue.length < rules.minLength) {
        return `${formatFieldName(fieldName)} must be at least ${rules.minLength} characters long`
    }

    // Check maximum length
    if (rules.maxLength && strValue.length > rules.maxLength) {
        return `${formatFieldName(fieldName)} must be less than ${rules.maxLength} characters`
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(strValue)) {
        return rules.message || `${formatFieldName(fieldName)} format is invalid`
    }

    // Check options (for select fields)
    if (rules.options && !rules.options.includes(strValue)) {
        return `Please select a valid ${formatFieldName(fieldName).toLowerCase()}`
    }

    // Check numeric minimum
    if (rules.min !== undefined) {
        const numValue = parseFloat(strValue)
        if (isNaN(numValue) || numValue < rules.min) {
            return `${formatFieldName(fieldName)} must be at least ${rules.min}`
        }
    }

    // Check numeric maximum
    if (rules.max !== undefined) {
        const numValue = parseFloat(strValue)
        if (isNaN(numValue) || numValue > rules.max) {
            return `${formatFieldName(fieldName)} must be no more than ${rules.max}`
        }
    }

    // Custom validations
    switch (fieldName) {
        case 'serial_number':
            return validateSerialNumber(strValue, formData)
        case 'size':
            return validateSize(strValue)
        case 'resolution':
            return validateResolution(strValue)
        case 'refresh_rate':
            return validateRefreshRate(strValue)
        case 'price':
            return validatePrice(strValue)
        default:
            return null
    }
}

/**
 * Validate the entire form
 * @param {Object} formData - The form data to validate
 * @param {Object} existingErrors - Existing errors to preserve
 * @returns {Object} - Object containing all validation errors
 */
export const validateForm = (formData, existingErrors = {}) => {
    const errors = {}

    Object.keys(monitorValidationRules).forEach(fieldName => {
        const error = validateField(fieldName, formData[fieldName], formData)
        if (error) {
            errors[fieldName] = error
        }
    })

    return errors
}

/**
 * Check if form has any validation errors
 * @param {Object} formData - The form data to validate
 * @returns {boolean} - True if form is valid, false if there are errors
 */
export const isFormValid = (formData) => {
    const errors = validateForm(formData)
    return Object.keys(errors).length === 0
}

// Helper validation functions
const validateSerialNumber = (value, formData) => {
    // Check for common serial number patterns
    if (value.length < 5) {
        return 'Serial number should be at least 5 characters for proper identification'
    }
    
    // Check for suspicious patterns
    if (/^(.)\1{4,}$/.test(value)) {
        return 'Serial number appears to be invalid (repeated characters)'
    }
    
    return null
}

const validateSize = (value) => {
    const numValue = parseInt(value)
    if (isNaN(numValue)) {
        return 'Size must be a valid number'
    }
    
    // Common monitor sizes
    const commonSizes = [19, 20, 21, 22, 23, 24, 27, 32, 34, 43, 49, 55, 65]
    if (!commonSizes.includes(numValue) && (numValue < 15 || numValue > 100)) {
        return 'Please verify the monitor size. Common sizes are 19", 22", 24", 27", 32", etc.'
    }
    
    return null
}

const validateResolution = (value) => {
    if (!value.includes('x')) {
        return 'Resolution must include "x" (e.g., 1920x1080)'
    }
    
    const [width, height] = value.split('x').map(num => parseInt(num.trim()))
    
    if (isNaN(width) || isNaN(height)) {
        return 'Resolution width and height must be valid numbers'
    }
    
    if (width < 640 || height < 480) {
        return 'Resolution seems too low. Minimum recommended is 640x480'
    }
    
    if (width > 7680 || height > 4320) {
        return 'Resolution seems unusually high. Please verify (max supported: 7680x4320)'
    }
    
    // Check aspect ratio reasonableness
    const aspectRatio = width / height
    if (aspectRatio < 0.5 || aspectRatio > 3.5) {
        return 'Resolution aspect ratio seems unusual. Please verify the values'
    }
    
    return null
}

const validateRefreshRate = (value) => {
    if (!value) return null // Optional field
    
    const numValue = parseInt(value)
    if (isNaN(numValue)) {
        return 'Refresh rate must be a valid number'
    }
    
    // Common refresh rates
    const commonRates = [30, 60, 75, 120, 144, 165, 240, 360]
    if (!commonRates.includes(numValue) && (numValue < 30 || numValue > 500)) {
        return 'Please verify refresh rate. Common rates are 60Hz, 75Hz, 120Hz, 144Hz, etc.'
    }
    
    return null
}

const validatePrice = (value) => {
    if (!value) return null // Optional field
    
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
        return 'Price must be a valid number'
    }
    
    if (numValue < 0) {
        return 'Price cannot be negative'
    }
    
    if (numValue > 999999.99) {
        return 'Price seems unusually high. Please verify'
    }
    
    // Check for reasonable pricing
    if (numValue > 0 && numValue < 500) {
        return 'Price seems low for a monitor. Please verify the amount'
    }
    
    return null
}

// Utility functions
const formatFieldName = (fieldName) => {
    return fieldName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * Get real-time validation message for a field as user types
 * @param {string} fieldName - The field name
 * @param {string} value - Current field value
 * @returns {string|null} - Validation message or null
 */
export const getRealTimeValidation = (fieldName, value) => {
    if (!value || value.trim() === '') return null
    
    const rules = monitorValidationRules[fieldName]
    if (!rules) return null
    
    // Only show pattern and length errors in real-time
    const strValue = value.toString().trim()
    
    if (rules.maxLength && strValue.length > rules.maxLength) {
        return `Maximum ${rules.maxLength} characters allowed`
    }
    
    if (rules.pattern && strValue.length >= (rules.minLength || 1)) {
        if (!rules.pattern.test(strValue)) {
            return rules.message || 'Invalid format'
        }
    }
    
    return null
}

/**
 * Sanitize form data before submission
 * @param {Object} formData - Raw form data
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
    const sanitized = {}
    
    Object.keys(formData).forEach(key => {
        let value = formData[key]
        
        if (typeof value === 'string') {
            value = value.trim()
            
            // Specific sanitization per field
            switch (key) {
                case 'serial_number':
                    value = value.toUpperCase().replace(/\s+/g, '')
                    break
                case 'brand':
                case 'model':
                    value = value.replace(/\s+/g, ' ')
                    break
                case 'resolution':
                    value = value.replace(/\s+/g, '').toLowerCase()
                    break
                case 'refresh_rate':
                    value = value.replace(/[^\d]/g, '')
                    break
                case 'size':
                    value = value.replace(/[^\d]/g, '')
                    break
                case 'price':
                    // Remove currency symbols and extra spaces
                    value = value.replace(/[₱$,\s]/g, '')
                    break
            }
        }
        
        sanitized[key] = value
    })
    
    return sanitized
}
