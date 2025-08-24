/**
 * Peripheral Form Validation Utility
 * Provides comprehensive validation for peripheral forms with real-time feedback and serial number validation
 */

export const peripheralValidationRules = {
    type: {
        required: true,
        maxLength: 255,
        message: 'Peripheral type is required and must not exceed 255 characters'
    },
    brand: {
        required: true,
        maxLength: 255,
        message: 'Brand is required and must not exceed 255 characters'
    },
    model: {
        required: true,
        maxLength: 255,
        message: 'Model is required and must not exceed 255 characters'
    },
    description: {
        required: false,
        maxLength: 1000,
        message: 'Description must not exceed 1000 characters'
    },
    unit_price: {
        required: false,
        pattern: /^\d+(\.\d{1,2})?$/,
        min: 0,
        message: 'Unit price must be a valid decimal number with up to 2 decimal places'
    },
    location: {
        required: true,
        maxLength: 255,
        message: 'Location is required and must not exceed 255 characters'
    },
    status: {
        required: true,
        enum: ['active', 'discontinued'],
        message: 'Status must be either active or discontinued'
    },
    notes: {
        required: false,
        maxLength: 1000,
        message: 'Notes must not exceed 1000 characters'
    },
    received_by: {
        required: true,
        maxLength: 255,
        message: 'Received by is required and must not exceed 255 characters'
    },
    supplier: {
        required: false,
        maxLength: 255,
        message: 'Supplier must not exceed 255 characters'
    },
    purchase_order: {
        required: false,
        maxLength: 255,
        message: 'Purchase order must not exceed 255 characters'
    },
    invoice_number: {
        required: false,
        maxLength: 255,
        message: 'Invoice number must not exceed 255 characters'
    },
    delivery_date: {
        required: true,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Delivery date is required and must be in YYYY-MM-DD format'
    },
    delivery_notes: {
        required: false,
        maxLength: 1000,
        message: 'Delivery notes must not exceed 1000 characters'
    }
};

export const peripheralSerialValidationRules = {
    serial_number: {
        required: true,
        minLength: 3,
        maxLength: 100,
        pattern: /^[A-Za-z0-9\-_]+$/,
        message: 'Serial number must be 3-100 characters and contain only letters, numbers, hyphens, and underscores'
    },
    unit_price: {
        required: false,
        pattern: /^\d+(\.\d{1,2})?$/,
        min: 0,
        message: 'Unit price must be a valid decimal number with up to 2 decimal places'
    },
    status: {
        required: true,
        enum: ['available', 'deployed', 'damaged', 'maintenance'],
        message: 'Status must be one of: available, deployed, damaged, maintenance'
    },
    deployed_to: {
        required: false,
        maxLength: 255,
        message: 'Deployed to must not exceed 255 characters'
    },
    delivery_date: {
        required: false,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Delivery date must be in YYYY-MM-DD format'
    },
    notes: {
        required: false,
        maxLength: 1000,
        message: 'Notes must not exceed 1000 characters'
    }
};

export const stockDeliveryValidationRules = {
    quantity_delivered: {
        required: true,
        pattern: /^\d+$/,
        min: 1,
        message: 'Quantity delivered must be a positive integer'
    },
    unit_price: {
        required: false,
        pattern: /^\d+(\.\d{1,2})?$/,
        min: 0,
        message: 'Unit price must be a valid decimal number with up to 2 decimal places'
    },
    supplier: {
        required: false,
        maxLength: 255,
        message: 'Supplier must not exceed 255 characters'
    },
    purchase_order: {
        required: false,
        maxLength: 255,
        message: 'Purchase order must not exceed 255 characters'
    },
    invoice_number: {
        required: false,
        maxLength: 255,
        message: 'Invoice number must not exceed 255 characters'
    },
    delivery_date: {
        required: true,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Delivery date is required and must be in YYYY-MM-DD format'
    },
    received_by: {
        required: true,
        maxLength: 255,
        message: 'Received by is required and must not exceed 255 characters'
    },
    notes: {
        required: false,
        maxLength: 1000,
        message: 'Notes must not exceed 1000 characters'
    },
    has_serial_numbers: {
        required: false,
        message: 'Serial number requirement must be specified'
    }
};

/**
 * Validate a single field value
 * @param {string} fieldName - The name of the field to validate
 * @param {any} value - The value to validate
 * @param {Object} rules - The validation rules to use
 * @returns {Object} - Validation result with isValid and message
 */
export const validateField = (fieldName, value, rules = peripheralValidationRules) => {
    const rule = rules[fieldName];
    if (!rule) return { isValid: true, message: '' };

    const stringValue = String(value || '').trim();

    // Required field validation
    if (rule.required && !stringValue) {
        return { isValid: false, message: rule.message };
    }

    // Skip other validations if field is empty and not required
    if (!stringValue && !rule.required) {
        return { isValid: true, message: '' };
    }

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
        return { isValid: false, message: rule.message };
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
        return { isValid: false, message: rule.message };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
        return { isValid: false, message: rule.message };
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
        return { isValid: false, message: rule.message };
    }

    // Numeric validations
    if (rule.min !== undefined) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue < rule.min) {
            return { isValid: false, message: rule.message };
        }
    }

    return { isValid: true, message: '' };
};

/**
 * Validate serial numbers array for duplicates and format
 * @param {Array} serialNumbers - Array of serial number strings
 * @param {Array} excludeSerials - Serial numbers to exclude from duplicate check (for editing)
 * @returns {Object} - Validation results with duplicates and invalid serials
 */
export const validateSerialNumbers = (serialNumbers, excludeSerials = []) => {
    const errors = {};
    const duplicates = [];
    const invalidSerials = [];
    
    if (!Array.isArray(serialNumbers)) {
        return { errors: { general: 'Serial numbers must be provided as an array' }, duplicates: [], invalidSerials: [] };
    }

    // Filter out empty strings and trim
    const cleanedSerials = serialNumbers
        .map((serial, index) => ({ value: String(serial || '').trim(), originalIndex: index }))
        .filter(item => item.value !== '');

    if (cleanedSerials.length === 0) {
        return { errors: {}, duplicates: [], invalidSerials: [] };
    }

    // Check for duplicates within the array
    const seen = new Set(excludeSerials);
    const localSeen = new Set();

    cleanedSerials.forEach(({ value, originalIndex }) => {
        // Validate serial number format
        const validation = validateField('serial_number', value, peripheralSerialValidationRules);
        if (!validation.isValid) {
            invalidSerials.push({
                index: originalIndex,
                serial: value,
                message: validation.message
            });
        }

        // Check for duplicates
        if (seen.has(value) || localSeen.has(value)) {
            duplicates.push({
                index: originalIndex,
                serial: value,
                message: 'Duplicate serial number found'
            });
        } else {
            localSeen.add(value);
        }
    });

    return { errors, duplicates, invalidSerials };
};

/**
 * Validate the entire peripheral form
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Complete validation results
 */
export const validatePeripheralForm = (formData) => {
    const errors = {};

    // Validate main fields
    Object.keys(peripheralValidationRules).forEach(field => {
        const validation = validateField(field, formData[field]);
        if (!validation.isValid) {
            errors[field] = validation.message;
        }
    });

    // Date validations
    if (formData.delivery_date) {
        const deliveryDate = new Date(formData.delivery_date);
        const today = new Date();
        
        if (deliveryDate > today) {
            errors.delivery_date = 'Delivery date cannot be in the future';
        }
    }

    return errors;
};

/**
 * Validate stock delivery form
 * @param {Object} formData - The stock delivery form data
 * @returns {Object} - Complete validation results
 */
export const validateStockDeliveryForm = (formData) => {
    const errors = {};

    // Validate main fields
    Object.keys(stockDeliveryValidationRules).forEach(field => {
        const validation = validateField(field, formData[field], stockDeliveryValidationRules);
        if (!validation.isValid) {
            errors[field] = validation.message;
        }
    });

    // Validate serial numbers if required
    if (formData.has_serial_numbers && formData.serial_numbers) {
        const serialValidation = validateSerialNumbers(formData.serial_numbers);
        
        if (serialValidation.duplicates.length > 0) {
            errors.serial_numbers = 'Duplicate serial numbers found in the list';
        }
        
        if (serialValidation.invalidSerials.length > 0) {
            errors.serial_numbers = serialValidation.invalidSerials[0].message;
        }

        // Check if quantity matches serial numbers count
        const validSerialCount = formData.serial_numbers.filter(s => s && s.trim()).length;
        const quantityDelivered = parseInt(formData.quantity_delivered) || 0;
        
        if (validSerialCount !== quantityDelivered) {
            errors.serial_numbers = `Number of serial numbers (${validSerialCount}) must match quantity delivered (${quantityDelivered})`;
        }
    }

    // Date validations
    if (formData.delivery_date) {
        const deliveryDate = new Date(formData.delivery_date);
        const today = new Date();
        
        if (deliveryDate > today) {
            errors.delivery_date = 'Delivery date cannot be in the future';
        }
    }

    return errors;
};

/**
 * Validate peripheral serial edit form
 * @param {Object} formData - The serial edit form data
 * @param {string} originalSerial - The original serial number (for duplicate checking)
 * @returns {Object} - Complete validation results
 */
export const validatePeripheralSerialForm = (formData, originalSerial = '') => {
    const errors = {};

    // Validate main fields
    Object.keys(peripheralSerialValidationRules).forEach(field => {
        const validation = validateField(field, formData[field], peripheralSerialValidationRules);
        if (!validation.isValid) {
            errors[field] = validation.message;
        }
    });

    // Date validations
    if (formData.delivery_date) {
        const deliveryDate = new Date(formData.delivery_date);
        const today = new Date();
        
        if (deliveryDate > today) {
            errors.delivery_date = 'Delivery date cannot be in the future';
        }
    }

    return errors;
};

/**
 * Get real-time validation function for a specific field
 * @param {string} fieldName - The field to validate
 * @param {Object} formData - Current form data
 * @param {Object} rules - Validation rules to use
 * @returns {Function} - Validation function
 */
export const getRealTimeValidation = (fieldName, formData, rules = peripheralValidationRules) => {
    return (value) => {
        return validateField(fieldName, value, rules);
    };
};

/**
 * Sanitize peripheral form data before submission
 * @param {Object} formData - The form data to sanitize
 * @returns {Object} - Sanitized form data
 */
export const sanitizePeripheralFormData = (formData) => {
    const sanitized = { ...formData };

    // Sanitize string fields
    const stringFields = [
        'type', 'brand', 'model', 'description', 'location', 'notes',
        'received_by', 'supplier', 'purchase_order', 'invoice_number', 'delivery_notes'
    ];

    stringFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = String(sanitized[field]).trim();
        }
    });

    // Sanitize numeric fields
    if (sanitized.unit_price) {
        sanitized.unit_price = parseFloat(sanitized.unit_price) || 0;
    }

    if (sanitized.quantity_delivered) {
        sanitized.quantity_delivered = parseInt(sanitized.quantity_delivered) || 0;
    }

    if (sanitized.initial_stock) {
        sanitized.initial_stock = parseInt(sanitized.initial_stock) || 0;
    }

    // Sanitize serial numbers array
    if (sanitized.serial_numbers && Array.isArray(sanitized.serial_numbers)) {
        sanitized.serial_numbers = sanitized.serial_numbers
            .map(serial => String(serial || '').trim().toUpperCase())
            .filter(serial => serial !== '');
    }

    return sanitized;
};

/**
 * Sanitize a single serial number
 * @param {string} serial - The serial number to sanitize
 * @returns {string} - Sanitized serial number
 */
export const sanitizeSerial = (serial) => {
    return String(serial || '').trim().toUpperCase();
};

/**
 * Check for duplicate peripheral serial number
 * @param {string} serialNumber - The serial number to check
 * @param {number} peripheralId - The peripheral ID to check within
 * @param {number|null} excludeSerialId - Serial ID to exclude from duplicate check (for edit mode)
 * @returns {Promise<boolean>} - True if duplicate exists
 */
export const checkDuplicatePeripheralSerial = async (serialNumber, peripheralId, excludeSerialId = null) => {
    if (!serialNumber || serialNumber.trim().length < 3) {
        return false;
    }

    try {
        const url = excludeSerialId 
            ? `/api/peripherals/${peripheralId}/check-duplicate-serial?serial=${encodeURIComponent(serialNumber)}&exclude=${excludeSerialId}`
            : `/api/peripherals/${peripheralId}/check-duplicate-serial?serial=${encodeURIComponent(serialNumber)}`;
            
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            return data.isDuplicate || false;
        }
    } catch (error) {
        console.error('Error checking duplicate peripheral serial:', error);
    }

    return false;
};

/**
 * Utility to check if form has any errors
 * @param {Object} errors - The errors object
 * @returns {boolean} - True if form has errors
 */
export const hasFormErrors = (errors) => {
    if (!errors || typeof errors !== 'object') return false;
    return Object.keys(errors).some(key => errors[key]);
};

/**
 * Add a new serial number input to the array
 * @param {Array} serialNumbers - Current serial numbers array
 * @returns {Array} - Updated serial numbers array
 */
export const addSerialNumberInput = (serialNumbers) => {
    return [...serialNumbers, ''];
};

/**
 * Remove a serial number input from the array
 * @param {Array} serialNumbers - Current serial numbers array
 * @param {number} index - Index to remove
 * @returns {Array} - Updated serial numbers array
 */
export const removeSerialNumberInput = (serialNumbers, index) => {
    return serialNumbers.filter((_, i) => i !== index);
};

/**
 * Update a specific serial number in the array
 * @param {Array} serialNumbers - Current serial numbers array
 * @param {number} index - Index to update
 * @param {string} value - New value
 * @returns {Array} - Updated serial numbers array
 */
export const updateSerialNumberInput = (serialNumbers, index, value) => {
    const updated = [...serialNumbers];
    updated[index] = value;
    return updated;
};

/**
 * Validates peripheral stock form data
 * @param {Object} formData - The stock form data to validate
 * @returns {Object} Validation errors object
 */
export const validatePeripheralStockForm = (formData) => {
    console.log('Peripheral Validation - Validating stock form:', formData);
    
    const errors = {}
    
    // Validate quantity for non-serial peripherals
    if (!formData.has_serial_numbers && (!formData.serial_numbers || formData.serial_numbers.length === 0)) {
        if (!formData.quantity || formData.quantity.trim() === '') {
            errors.quantity = 'Quantity is required when not using serial numbers'
        } else {
            const qty = parseInt(formData.quantity)
            if (isNaN(qty) || qty <= 0) {
                errors.quantity = 'Quantity must be a positive number'
            } else if (qty > 10000) {
                errors.quantity = 'Quantity cannot exceed 10,000 items'
            }
        }
    }
    
    // Validate unit price
    if (formData.unit_price && formData.unit_price.trim() !== '') {
        const price = parseFloat(formData.unit_price)
        if (isNaN(price) || price < 0) {
            errors.unit_price = 'Unit price must be a valid positive number'
        } else if (price > 1000000) {
            errors.unit_price = 'Unit price seems unusually high'
        }
    }
    
    // Validate supplier name
    if (formData.supplier && formData.supplier.length > 100) {
        errors.supplier = 'Supplier name cannot exceed 100 characters'
    }
    
    // Validate purchase order
    if (formData.purchase_order && formData.purchase_order.length > 50) {
        errors.purchase_order = 'Purchase order cannot exceed 50 characters'
    }
    
    // Validate invoice number
    if (formData.invoice_number && formData.invoice_number.length > 50) {
        errors.invoice_number = 'Invoice number cannot exceed 50 characters'
    }
    
    // Validate delivery date
    if (!formData.delivery_date || formData.delivery_date.trim() === '') {
        errors.delivery_date = 'Delivery date is required'
    } else {
        const deliveryDate = new Date(formData.delivery_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (isNaN(deliveryDate.getTime())) {
            errors.delivery_date = 'Please enter a valid delivery date'
        } else if (deliveryDate > new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000))) {
            errors.delivery_date = 'Delivery date cannot be more than 1 year in the future'
        }
    }
    
    // Validate received_by
    if (!formData.received_by || formData.received_by.trim() === '') {
        errors.received_by = 'Received by field is required'
    } else if (formData.received_by.length > 100) {
        errors.received_by = 'Received by name cannot exceed 100 characters'
    }
    
    // Validate notes
    if (formData.notes && formData.notes.length > 1000) {
        errors.notes = 'Notes cannot exceed 1000 characters'
    }
    
    // Validate serial numbers if using them
    if (formData.has_serial_numbers && formData.serial_numbers) {
        if (!Array.isArray(formData.serial_numbers) || formData.serial_numbers.length === 0) {
            errors.serial_numbers = 'At least one serial number is required when using serial numbers'
        } else {
            const validSerials = formData.serial_numbers.filter(s => s && s.trim() !== '')
            if (validSerials.length === 0) {
                errors.serial_numbers = 'At least one valid serial number is required'
            } else if (validSerials.length > 1000) {
                errors.serial_numbers = 'Cannot add more than 1000 items at once'
            }
        }
    }
    
    console.log('Stock form validation result:', errors);
    return errors
}

// Export all validation functions
export default {
    validateField,
    validatePeripheralForm,
    validateStockDeliveryForm,
    validatePeripheralSerialForm,
    validatePeripheralStockForm,
    validateSerialNumbers,
    getRealTimeValidation,
    sanitizePeripheralFormData,
    sanitizeSerial,
    checkDuplicatePeripheralSerial,
    hasFormErrors,
    addSerialNumberInput,
    removeSerialNumberInput,
    updateSerialNumberInput,
    peripheralValidationRules,
    peripheralSerialValidationRules,
    stockDeliveryValidationRules
};
