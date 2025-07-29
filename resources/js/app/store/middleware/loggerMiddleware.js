/**
 * Redux Logger Middleware
 * 
 * This middleware logs all dispatched actions and the resulting new state.
 * It's useful for debugging Redux state management issues.
 * 
 * Usage:
 * In your Redux store configuration file, import this middleware and add it:
 * 
 * import { createStore, applyMiddleware } from 'redux';
 * import rootReducer from './reducers';
 * import loggerMiddleware from './path/to/loggerMiddleware';
 * 
 * const store = createStore(
 *   rootReducer,
 *   applyMiddleware(
 *     loggerMiddleware,
 *     // other middlewares...
 *   )
 * );
 */

const loggerMiddleware = store => next => action => {
    console.group(`%cRedux Action: ${action.type}`, 'color: #00b3ff; font-weight: bold;');
    console.log('%cPrevious State:', 'color: #9E9E9E; font-weight: bold;', store.getState());
    console.log('%cAction:', 'color: #00b3ff; font-weight: bold;', action);
    
    // Let the action proceed through the reducer
    const result = next(action);
    
    console.log('%cNext State:', 'color: #4CAF50; font-weight: bold;', store.getState());
    console.groupEnd();
    
    // Return the result of the next middleware or reducer
    return result;
};

export default loggerMiddleware;
