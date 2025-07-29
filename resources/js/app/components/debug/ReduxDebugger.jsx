import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Redux Debugger Component
 * 
 * A utility component for debugging Redux state and dispatching test actions
 * Only use this component during development
 */
const ReduxDebugger = ({ stateKey = null, showInitially = false }) => {
    const [isVisible, setIsVisible] = useState(showInitially);
    const [expandedSections, setExpandedSections] = useState({});
    const dispatch = useDispatch();
    
    // Get the entire state or just a slice if stateKey is provided
    const fullState = useSelector(state => stateKey ? state[stateKey] : state);
    
    // Toggle visibility of debug panel
    const toggleVisibility = () => setIsVisible(!isVisible);
    
    // Toggle expanded section
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    
    // Dispatch a test action to add mock data
    const dispatchTestAction = (key) => {
        const mockData = {
            parts: [
                { id: 999, name: 'Test Part 1', category: 'CPU', brand: 'Debug', model: 'Test-001', status: 'Available', quantity: 10 },
                { id: 998, name: 'Test Part 2', category: 'RAM', brand: 'Debug', model: 'Test-002', status: 'Available', quantity: 5 }
            ]
        };
        
        dispatch({
            type: 'SET_TEST_DATA',
            payload: key ? { [key]: mockData[key] } : mockData
        });
    };
    
    // Pretty print object for display
    const prettyPrint = (obj) => {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return 'Error displaying state: ' + e.message;
        }
    };
    
    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button 
                    onClick={toggleVisibility}
                    className="bg-red-600 text-white px-3 py-1 rounded shadow-lg text-xs"
                >
                    Debug Redux
                </button>
            </div>
        );
    }
    
    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-auto bg-gray-800 text-white rounded-lg shadow-xl z-50 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Redux State Debugger</h3>
                <button 
                    onClick={toggleVisibility}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                >
                    Close
                </button>
            </div>
            
            <div className="mb-4">
                <button 
                    onClick={() => dispatchTestAction(stateKey)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded mr-2 text-xs"
                >
                    Dispatch Test Data
                </button>
                <button 
                    onClick={() => console.log('Redux State:', fullState)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                >
                    Log State
                </button>
            </div>
            
            <div className="bg-gray-900 p-2 rounded">
                {Object.keys(fullState || {}).length > 0 ? (
                    Object.keys(fullState || {}).map(key => (
                        <div key={key} className="mb-2">
                            <div 
                                onClick={() => toggleSection(key)}
                                className="flex justify-between items-center cursor-pointer bg-gray-700 hover:bg-gray-600 p-2 rounded"
                            >
                                <span>{key}</span>
                                <span>{expandedSections[key] ? '▼' : '►'}</span>
                            </div>
                            
                            {expandedSections[key] && (
                                <pre className="bg-gray-700 p-2 rounded mt-1 text-xs overflow-auto max-h-60">
                                    {prettyPrint(fullState[key])}
                                </pre>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-red-400">State is empty or undefined</p>
                )}
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
                Redux Debugger v1.0.0 - Remove this component before production deployment
            </div>
        </div>
    );
};

export default ReduxDebugger;
