/**
 * Redux State Fixer Utilities
 * 
 * This file contains utilities to help diagnose and fix Redux state issues,
 * particularly focusing on parts data not showing up correctly in the UI.
 */

/**
 * Analyzes the Redux state for common issues and tries to fix them
 * @param {Object} store - The Redux store
 * @returns {Object} - Information about fixes applied
 */
export const analyzeAndFixReduxState = (store) => {
    const state = store.getState();
    const results = {
        initialState: JSON.parse(JSON.stringify(state)),
        issues: [],
        fixesApplied: [],
        recommendations: []
    };
    
    // Check if parts state exists
    if (!state.parts) {
        results.issues.push('Parts state is missing from Redux store');
        
        // Initialize parts state
        store.dispatch({
            type: 'INITIALIZE_PARTS_STATE',
            payload: { parts: [], deliveryHistory: [] }
        });
        
        results.fixesApplied.push('Initialized empty parts state');
        results.recommendations.push('Check Redux reducer setup to ensure it handles parts state correctly');
    }
    
    // Check if parts array is properly structured
    if (state.parts && !Array.isArray(state.parts.parts)) {
        results.issues.push('parts.parts is not an array or is missing');
        
        // Fix by ensuring we have the right structure
        if (Array.isArray(state.parts)) {
            // If state.parts is an array directly, move it to state.parts.parts
            store.dispatch({
                type: 'FIX_PARTS_STRUCTURE',
                payload: { parts: state.parts, deliveryHistory: [] }
            });
            results.fixesApplied.push('Moved direct array to correct location in state structure');
        } else {
            // Initialize with empty array
            store.dispatch({
                type: 'FIX_PARTS_STRUCTURE',
                payload: { parts: [], deliveryHistory: [] }
            });
            results.fixesApplied.push('Created empty parts array in correct structure');
        }
        
        results.recommendations.push('Review parts reducer to ensure it maintains the correct state structure');
    }
    
    // Return updated state after fixes
    const updatedState = store.getState();
    results.finalState = JSON.parse(JSON.stringify(updatedState));
    
    return results;
};

/**
 * Applies mock data to Redux store for testing UI without backend
 * @param {Object} store - The Redux store
 * @param {boolean} keepExisting - Whether to keep existing data or replace it
 * @returns {Array} - The mock data that was added
 */
export const applyMockPartsData = (store, keepExisting = false) => {
    const mockParts = [
        { id: 101, type: 'cpu', brand: 'Intel', model: 'Core i7-12700K', current_stock: 8, location: 'main', unit_price: 899.99 },
        { id: 102, type: 'gpu', brand: 'NVIDIA', model: 'RTX 4080', current_stock: 3, location: 'main', unit_price: 1499.99 },
        { id: 103, type: 'ram', brand: 'Corsair', model: 'Vengeance DDR5', current_stock: 12, location: 'main', unit_price: 249.99 },
        { id: 104, type: 'storage', brand: 'Samsung', model: '990 PRO', current_stock: 7, location: 'storage', unit_price: 199.99 },
        { id: 105, type: 'motherboard', brand: 'ASUS', model: 'ROG Strix Z690', current_stock: 2, location: 'main', unit_price: 429.99 },
        { id: 106, type: 'psu', brand: 'Corsair', model: 'RM850x', current_stock: 5, location: 'storage', unit_price: 129.99 },
        { id: 107, type: 'cooling', brand: 'NZXT', model: 'Kraken X63', current_stock: 0, location: 'main', unit_price: 149.99 },
        { id: 108, type: 'case', brand: 'Lian Li', model: 'PC-O11', current_stock: 1, location: 'storage', unit_price: 179.99 },
    ];
    
    const state = store.getState();
    let existingParts = [];
    
    if (keepExisting && state.parts && Array.isArray(state.parts.parts)) {
        existingParts = [...state.parts.parts];
    }
    
    // Merge or replace parts
    const combinedParts = keepExisting ? [...existingParts, ...mockParts] : mockParts;
    
    // Dispatch update
    store.dispatch({
        type: 'FETCH_PARTS_SUCCESS',
        payload: {
            parts: combinedParts,
            deliveryHistory: []
        }
    });
    
    return combinedParts;
};

/**
 * Creates a middleware that logs all parts-related actions
 * @returns {Function} Redux middleware function
 */
export const createPartsDebugMiddleware = () => {
    return store => next => action => {
        // Check if action is related to parts
        if (action.type && (
            action.type.includes('PARTS') || 
            action.type.includes('PART_') || 
            action.type.includes('INVENTORY')
        )) {
            console.group(`%c🔍 PARTS ACTION: ${action.type}`, 'color: #8e44ad; font-weight: bold;');
            console.log('%cPrevious Parts State:', 'color: #7f8c8d;', store.getState().parts);
            console.log('%cAction:', 'color: #2980b9;', action);
        }
        
        // Let the action proceed through the reducer
        const result = next(action);
        
        // Log the result for parts-related actions
        if (action.type && (
            action.type.includes('PARTS') || 
            action.type.includes('PART_') || 
            action.type.includes('INVENTORY')
        )) {
            console.log('%cNew Parts State:', 'color: #27ae60;', store.getState().parts);
            console.groupEnd();
        }
        
        return result;
    };
};
