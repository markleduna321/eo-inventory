/**
 * This is a defensive reducer for the parts state
 * It handles common issues with Redux state structure and ensures
 * that the parts data is always available in the expected format
 */

// Initial state structure that should always be present
const initialState = {
    parts: [],
    deliveryHistory: [],
    loading: false,
    error: null,
    initialized: false
};

/**
 * Parts reducer with defensive programming patterns
 */
const partsReducer = (state = initialState, action) => {
    // Make sure we always have a valid state object
    if (!state) {
        console.warn('Parts reducer received null/undefined state, using initialState');
        state = { ...initialState };
    }
    
    // Always ensure we have the expected structure
    const safeState = {
        ...initialState,
        ...state,
        // Ensure parts is always an array
        parts: Array.isArray(state.parts) ? state.parts : 
               (Array.isArray(state?.parts?.parts) ? state.parts.parts : []),
        // Ensure deliveryHistory is always an array
        deliveryHistory: Array.isArray(state.deliveryHistory) ? state.deliveryHistory :
                         (Array.isArray(state?.parts?.deliveryHistory) ? state.parts.deliveryHistory : [])
    };
    
    switch (action.type) {
        case 'FETCH_PARTS_REQUEST':
            return {
                ...safeState,
                loading: true,
                error: null
            };
            
        case 'FETCH_PARTS_SUCCESS':
            // Defensively handle the payload structure
            const parts = action.payload?.parts || [];
            const deliveryHistory = action.payload?.deliveryHistory || [];
            
            console.log('FETCH_PARTS_SUCCESS processed with', parts.length, 'parts');
            
            return {
                ...safeState,
                parts: parts,
                deliveryHistory: deliveryHistory,
                loading: false,
                initialized: true,
                error: null,
                lastUpdated: new Date().toISOString()
            };
            
        case 'FETCH_PARTS_FAILURE':
            return {
                ...safeState,
                loading: false,
                error: action.payload?.error || 'Unknown error',
                initialized: true
            };
            
        case 'ADD_PART':
            // Defensively ensure we have a valid part object
            if (!action.payload || !action.payload.part) {
                console.error('ADD_PART called without a valid part object');
                return safeState;
            }
            
            return {
                ...safeState,
                parts: [...safeState.parts, action.payload.part],
                lastUpdated: new Date().toISOString()
            };
            
        case 'UPDATE_PART':
            // Defensively ensure we have a valid part object with id
            if (!action.payload || !action.payload.part || !action.payload.part.id) {
                console.error('UPDATE_PART called without a valid part object or id');
                return safeState;
            }
            
            return {
                ...safeState,
                parts: safeState.parts.map(part => 
                    part.id === action.payload.part.id ? action.payload.part : part
                ),
                lastUpdated: new Date().toISOString()
            };
            
        case 'DELETE_PART':
            // Defensively ensure we have a valid id
            if (!action.payload || !action.payload.id) {
                console.error('DELETE_PART called without a valid id');
                return safeState;
            }
            
            return {
                ...safeState,
                parts: safeState.parts.filter(part => part.id !== action.payload.id),
                lastUpdated: new Date().toISOString()
            };
            
        case 'INITIALIZE_PARTS_STATE':
            // Special action to initialize parts state if missing
            return {
                ...initialState,
                ...action.payload,
                initialized: true
            };
            
        case 'FIX_PARTS_STRUCTURE':
            // Special action to fix parts structure issues
            return {
                ...initialState,
                ...action.payload,
                initialized: true,
                lastUpdated: new Date().toISOString()
            };
            
        case 'SET_TEST_DATA':
            // Special action for testing
            return {
                ...safeState,
                ...action.payload,
                initialized: true,
                lastUpdated: new Date().toISOString()
            };
            
        default:
            return safeState;
    }
};

export default partsReducer;
