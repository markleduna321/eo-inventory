/**
 * System Unit Form Validation Utility
 * Provides comprehensive validation for system unit forms with real-time feedback
 */

export const systemUnitValidationRules = {
    unit_type: {
        required: true,
        message: 'Unit type is required'
    },
    system_name: {
        required: true,
        minLength: 2,
        maxLength: 255,
        message: 'System name must be between 2 and 255 characters'
    },
    serial_number: {
        required: true,
        minLength: 3,
        maxLength: 100,
        pattern: /^[A-Za-z0-9\-_]+$/,
        message: 'Serial number must be 3-100 characters and contain only letters, numbers, hyphens, and underscores'
    },
    brand: {
        required: false,
        maxLength: 100,
        message: 'Brand name must not exceed 100 characters'
    },
    model: {
        required: false,
        maxLength: 100,
        message: 'Model must not exceed 100 characters'
    },
    description: {
        required: false,
        maxLength: 1000,
        message: 'Description must not exceed 1000 characters'
    },
    operating_system: {
        required: false,
        maxLength: 100,
        message: 'Operating system must not exceed 100 characters'
    },
    mac_address: {
        required: false,
        pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
        message: 'MAC address must be in format AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF'
    },
    status: {
        required: true,
        enum: ['available', 'assigned', 'maintenance', 'retired'],
        message: 'Status must be one of: available, assigned, maintenance, retired'
    },
    location: {
        required: false,
        maxLength: 100,
        message: 'Location must not exceed 100 characters'
    },
    assigned_to: {
        required: false,
        maxLength: 100,
        message: 'Assigned to must not exceed 100 characters'
    },
    received_by: {
        required: true,
        maxLength: 100,
        message: 'Received by is required and must not exceed 100 characters'
    },
    purchase_price: {
        required: false,
        pattern: /^\d+(\.\d{1,2})?$/,
        message: 'Purchase price must be a valid decimal number with up to 2 decimal places'
    },
    supplier: {
        required: false,
        maxLength: 255,
        message: 'Supplier must not exceed 255 characters'
    },
    purchase_date: {
        required: false,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Purchase date must be in YYYY-MM-DD format'
    },
    warranty_expiry: {
        required: false,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        message: 'Warranty expiry must be in YYYY-MM-DD format'
    },
    notes: {
        required: false,
        maxLength: 1000,
        message: 'Notes must not exceed 1000 characters'
    }
};

export const specificationValidationRules = {
    cpu: {
        required: false,
        maxLength: 255,
        message: 'CPU specification must not exceed 255 characters'
    },
    ram: {
        required: false,
        maxLength: 100,
        message: 'RAM specification must not exceed 100 characters'
    },
    storage: {
        required: false,
        maxLength: 255,
        message: 'Storage specification must not exceed 255 characters'
    },
    gpu: {
        required: false,
        maxLength: 255,
        message: 'GPU specification must not exceed 255 characters'
    },
    motherboard: {
        required: false,
        maxLength: 255,
        message: 'Motherboard specification must not exceed 255 characters'
    },
    psu: {
        required: false,
        maxLength: 255,
        message: 'PSU specification must not exceed 255 characters'
    },
    case: {
        required: false,
        maxLength: 255,
        message: 'Case specification must not exceed 255 characters'
    }
};

export const componentValidationRules = {
    part_item_id: {
        required: true,
        message: 'Part item is required for each component'
    },
    component_role: {
        required: true,
        enum: ['cpu', 'ram', 'storage', 'gpu', 'motherboard', 'psu', 'case'],
        message: 'Component role is required and must be valid'
    }
};

/**
 * Validate a single field value
 * @param {string} fieldName - The name of the field to validate
 * @param {any} value - The value to validate
 * @param {Object} rules - The validation rules to use
 * @returns {Object} - Validation result with isValid and message
 */
export const validateField = (fieldName, value, rules = systemUnitValidationRules) => {
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

    return { isValid: true, message: '' };
};

/**
 * Validate specifications object
 * @param {Object} specifications - The specifications object to validate
 * @returns {Object} - Validation results for each specification field
 */
export const validateSpecifications = (specifications) => {
    const errors = {};
    
    Object.keys(specificationValidationRules).forEach(field => {
        const validation = validateField(field, specifications[field], specificationValidationRules);
        if (!validation.isValid) {
            errors[field] = validation.message;
        }
    });

    return errors;
};

/**
 * Validate components array
 * @param {Array} components - The components array to validate
 * @returns {Object} - Validation results for components
 */
export const validateComponents = (components) => {
    const errors = {};
    
    if (!Array.isArray(components)) {
        return { general: 'Components must be an array' };
    }

    components.forEach((component, index) => {
        const componentErrors = {};
        
        Object.keys(componentValidationRules).forEach(field => {
            const validation = validateField(field, component[field], componentValidationRules);
            if (!validation.isValid) {
                componentErrors[field] = validation.message;
            }
        });

        if (Object.keys(componentErrors).length > 0) {
            errors[index] = componentErrors;
        }
    });

    // Check for duplicate component roles
    const roles = components.map(c => c.component_role).filter(Boolean);
    const duplicateRoles = roles.filter((role, index) => roles.indexOf(role) !== index);
    
    if (duplicateRoles.length > 0) {
        errors.duplicateRoles = `Duplicate component roles found: ${[...new Set(duplicateRoles)].join(', ')}`;
    }

    return errors;
};

/**
 * Validate the entire form
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Complete validation results
 */
export const validateForm = (formData) => {
    const errors = {};

    // Validate main fields
    Object.keys(systemUnitValidationRules).forEach(field => {
        const validation = validateField(field, formData[field]);
        if (!validation.isValid) {
            errors[field] = validation.message;
        }
    });

    // Validate specifications for pre-built units
    if (formData.unit_type === 'pre_built' && formData.specifications) {
        const specErrors = validateSpecifications(formData.specifications);
        if (Object.keys(specErrors).length > 0) {
            errors.specifications = specErrors;
        }
    }

    // Validate components for custom-built units
    if (formData.unit_type === 'custom_built' && formData.components) {
        const componentErrors = validateComponents(formData.components);
        if (Object.keys(componentErrors).length > 0) {
            errors.components = componentErrors;
        }
        
        // Require at least one component for custom-built units
        if (!formData.components || formData.components.length === 0) {
            errors.components = { general: 'At least one component is required for custom-built units' };
        }
    }

    // Date validations
    if (formData.purchase_date && formData.warranty_expiry) {
        const purchaseDate = new Date(formData.purchase_date);
        const warrantyDate = new Date(formData.warranty_expiry);
        
        if (warrantyDate < purchaseDate) {
            errors.warranty_expiry = 'Warranty expiry cannot be before purchase date';
        }
    }

    return errors;
};

/**
 * Get real-time validation function for a specific field
 * @param {string} fieldName - The field to validate
 * @param {Object} formData - Current form data
 * @returns {Function} - Validation function
 */
export const getRealTimeValidation = (fieldName, formData) => {
    return (value) => {
        // For specifications
        if (fieldName.startsWith('specifications.')) {
            const specField = fieldName.replace('specifications.', '');
            return validateField(specField, value, specificationValidationRules);
        }

        // For regular fields
        return validateField(fieldName, value);
    };
};

/**
 * Sanitize form data before submission
 * @param {Object} formData - The form data to sanitize
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
    const sanitized = { ...formData };

    // Sanitize string fields
    const stringFields = [
        'system_name', 'serial_number', 'brand', 'model', 'description',
        'operating_system', 'mac_address', 'location', 'assigned_to',
        'received_by', 'supplier', 'notes'
    ];

    stringFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = String(sanitized[field]).trim();
        }
    });

    // Sanitize price field
    if (sanitized.purchase_price) {
        sanitized.purchase_price = parseFloat(sanitized.purchase_price) || 0;
    }

    // Sanitize MAC address format
    if (sanitized.mac_address) {
        sanitized.mac_address = sanitized.mac_address.toUpperCase().replace(/-/g, ':');
    }

    // Sanitize specifications
    if (sanitized.specifications) {
        Object.keys(sanitized.specifications).forEach(key => {
            if (sanitized.specifications[key]) {
                sanitized.specifications[key] = String(sanitized.specifications[key]).trim();
            }
        });
    }

    // Remove empty components
    if (sanitized.components) {
        sanitized.components = sanitized.components.filter(component => 
            component.part_item_id && component.component_role
        );
    }

    return sanitized;
};

/**
 * Check for duplicate serial number
 * @param {string} serialNumber - The serial number to check
 * @param {number|null} excludeId - ID to exclude from duplicate check (for edit mode)
 * @returns {Promise<boolean>} - True if duplicate exists
 */
export const checkDuplicateSerial = async (serialNumber, excludeId = null) => {
    if (!serialNumber || serialNumber.trim().length < 3) {
        return false;
    }

    try {
        const url = excludeId 
            ? `/api/system-units/check-duplicate-serial?serial=${encodeURIComponent(serialNumber)}&exclude=${excludeId}`
            : `/api/system-units/check-duplicate-serial?serial=${encodeURIComponent(serialNumber)}`;
            
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            return data.isDuplicate || false;
        }
    } catch (error) {
        console.error('Error checking duplicate serial:', error);
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
    
    const hasDirectErrors = Object.keys(errors).some(key => {
        if (key === 'specifications' || key === 'components') return false;
        return errors[key];
    });

    if (hasDirectErrors) return true;

    // Check specifications errors
    if (errors.specifications && typeof errors.specifications === 'object') {
        if (Object.keys(errors.specifications).length > 0) return true;
    }

    // Check components errors
    if (errors.components && typeof errors.components === 'object') {
        if (Object.keys(errors.components).length > 0) return true;
    }

    return false;
};

export default {
    validateField,
    validateForm,
    validateSpecifications,
    validateComponents,
    getRealTimeValidation,
    sanitizeFormData,
    checkDuplicateSerial,
    hasFormErrors,
    systemUnitValidationRules,
    specificationValidationRules,
    componentValidationRules
};
