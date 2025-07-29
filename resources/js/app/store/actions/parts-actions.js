/**
 * Redux Action Creators for Parts Management
 * 
 * This file contains standardized action creators for parts management
 * with enhanced debugging capabilities.
 */

// Action Types Constants
export const ACTION_TYPES = {
    FETCH_PARTS_REQUEST: 'FETCH_PARTS_REQUEST',
    FETCH_PARTS_SUCCESS: 'FETCH_PARTS_SUCCESS',
    FETCH_PARTS_FAILURE: 'FETCH_PARTS_FAILURE',
    ADD_PART: 'ADD_PART',
    UPDATE_PART: 'UPDATE_PART',
    DELETE_PART: 'DELETE_PART',
    INITIALIZE_PARTS_STATE: 'INITIALIZE_PARTS_STATE',
    FIX_PARTS_STRUCTURE: 'FIX_PARTS_STRUCTURE',
    SET_TEST_DATA: 'SET_TEST_DATA'
};

// Action Creators
export const fetchPartsRequest = () => {
    console.log('[Redux Action] fetchPartsRequest dispatched');
    return {
        type: ACTION_TYPES.FETCH_PARTS_REQUEST
    };
};

export const fetchPartsSuccess = (parts, deliveryHistory = []) => {
    console.log('[Redux Action] fetchPartsSuccess dispatched with', parts?.length || 0, 'parts');
    return {
        type: ACTION_TYPES.FETCH_PARTS_SUCCESS,
        payload: { parts, deliveryHistory }
    };
};

export const fetchPartsFailure = (error) => {
    console.error('[Redux Action] fetchPartsFailure dispatched with error:', error);
    return {
        type: ACTION_TYPES.FETCH_PARTS_FAILURE,
        payload: { error }
    };
};

export const addPart = (part) => {
    return {
        type: ACTION_TYPES.ADD_PART,
        payload: { part }
    };
};

export const updatePart = (part) => {
    return {
        type: ACTION_TYPES.UPDATE_PART,
        payload: { part }
    };
};

export const deletePart = (id) => {
    return {
        type: ACTION_TYPES.DELETE_PART,
        payload: { id }
    };
};

// Debugging & Fixing Actions
export const initializePartsState = () => {
    console.log('[Redux Debug] Initializing empty parts state');
    return {
        type: ACTION_TYPES.INITIALIZE_PARTS_STATE,
        payload: { parts: [], deliveryHistory: [] }
    };
};

export const fixPartsStructure = (parts = [], deliveryHistory = []) => {
    console.log('[Redux Debug] Fixing parts state structure');
    return {
        type: ACTION_TYPES.FIX_PARTS_STRUCTURE,
        payload: { parts, deliveryHistory }
    };
};

export const loadTestData = (replace = true) => {
    console.log('[Redux Debug] Loading test data (replace=', replace, ')');
    
    const testParts = [
        { id: 101, type: 'cpu', brand: 'Intel', model: 'Core i7-12700K', current_stock: 8, location: 'main', unit_price: 899.99 },
        { id: 102, type: 'gpu', brand: 'NVIDIA', model: 'RTX 4080', current_stock: 3, location: 'main', unit_price: 1499.99 },
        { id: 103, type: 'ram', brand: 'Corsair', model: 'Vengeance DDR5', current_stock: 12, location: 'main', unit_price: 249.99 },
        { id: 104, type: 'storage', brand: 'Samsung', model: '990 PRO', current_stock: 7, location: 'storage', unit_price: 199.99 },
        { id: 105, type: 'motherboard', brand: 'ASUS', model: 'ROG Strix Z690', current_stock: 2, location: 'main', unit_price: 429.99 }
    ];
    
    return {
        type: ACTION_TYPES.FETCH_PARTS_SUCCESS,
        payload: { parts: testParts, deliveryHistory: [] },
        meta: { isTestData: true }
    };
};
