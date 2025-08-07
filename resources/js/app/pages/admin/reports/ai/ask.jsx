import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../layout';
// Ensure CSRF token is properly set up
import '../../../../../bootstrap';

const AskAI = ({ debugMode = false }) => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [recentQuestions, setRecentQuestions] = useState([
        'What is the total value of our inventory?',
        'Which department has the highest number of monitors?',
        'How many parts are below the minimum stock level?',
        'What was our asset utilization rate last month?'
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!question.trim()) {
            toast.error('Please enter a question');
            return;
        }
        
        try {
            setLoading(true);
            console.log('Sending request with question:', question);
            
            // Add to recent questions if not already there
            if (!recentQuestions.includes(question)) {
                setRecentQuestions(prev => [question, ...prev.slice(0, 4)]);
            }
            
            // Use the real endpoint with better error handling
            // Add a longer timeout for the request (15 seconds)
            const res = await axios.post('/api/reports/ask-ai', { 
                question,
                reportContext: null
            }, {
                timeout: 15000 // 15 second timeout
            });
            
            console.log('API response:', res.data);
            
            // Validate response structure
            if (res.data && typeof res.data.answer === 'string') {
                setResponse(res.data);
                
                // Show relevant toast based on response contents
                if (res.data.error === 'rate_limit_exceeded') {
                    toast.warning('AI service is experiencing high demand. Try again shortly.');
                } else if (res.data.is_fallback) {
                    toast.info('Using fallback response (AI service unavailable)');
                } else {
                    toast.success('AI response generated');
                }
                
                // If we received model info, log it for debugging
                if (res.data.model) {
                    console.log(`Response generated using model: ${res.data.model}`);
                }
            } else {
                console.warn('Invalid response format:', res.data);
                throw new Error('Received an invalid response format');
            }
            
            // Only use test endpoint if there's an issue with OpenAI
            // and only in debug mode
            if (debugMode && res.data.answer && (
                res.data.answer.includes('could not process') || 
                res.data.answer.includes('not configured') ||
                res.data.answer.includes('technical issue') ||
                res.data.answer.includes('high demand')
            )) {
                try {
                    console.log('Fallback to test endpoint due to OpenAI issue');
                    const testRes = await axios.post('/api/test-ask-ai', { 
                        question,
                        reportContext: null
                    });
                    console.log('Test endpoint response:', testRes.data);
                    
                    if (testRes.data && typeof testRes.data.answer === 'string') {
                        setResponse(testRes.data);
                        toast.info('Using test response as fallback');
                    } else {
                        console.warn('Invalid test response format:', testRes.data);
                    }
                } catch (testError) {
                    console.warn('Test endpoint failed:', testError);
                }
            }
        } catch (error) {
            console.error('Error asking AI:', error);
            
            // Better error logging and display
            const errorDetails = {
                message: error.message,
                responseData: error.response?.data,
                responseStatus: error.response?.status
            };
            console.error('Error details:', errorDetails);
            
            // Check for timeout errors specifically
            const isTimeout = error.code === 'ECONNABORTED' || 
                             (error.message && error.message.includes('timeout'));
            
            if (isTimeout) {
                toast.error('AI service took too long to respond. Please try again.');
                
                // Set a simple response to show the user
                setResponse({
                    answer: 'The AI service took too long to respond. This might be due to high demand or complex data processing. Please try again or simplify your question.',
                    data: [],
                    error: 'timeout',
                    is_fallback: true,
                    generatedAt: new Date().toLocaleString()
                });
            } 
            // If in debug mode, try the test endpoint as fallback for any error
            else if (debugMode) {
                try {
                    console.log('Attempting fallback to test endpoint after error');
                    const testRes = await axios.post('/api/test-ask-ai', { 
                        question,
                        reportContext: null
                    });
                    console.log('Test endpoint response:', testRes.data);
                    setResponse(testRes.data);
                    toast.warning('Using test response due to API error');
                } catch (testError) {
                    console.warn('Test endpoint also failed:', testError);
                    toast.error('Both primary and backup AI services failed');
                }
            } else {
                // Show specific error messages based on response
                if (error.response?.status === 429) {
                    toast.error('AI service rate limit reached. Please try again later.');
                    
                    // Set a user-friendly response
                    setResponse({
                        answer: 'The AI service is currently experiencing high demand. Please try again in a few moments.',
                        data: [],
                        error: 'rate_limit_exceeded',
                        is_fallback: true,
                        generatedAt: new Date().toLocaleString()
                    });
                } else if (error.response?.status === 500) {
                    toast.error('Server error processing your question. Our team has been notified.');
                } else {
                    toast.error(`Failed to get a response: ${error.message}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // For testing endpoints directly with simple text question
    const testEndpoint = async (endpoint) => {
        try {
            setDebugInfo({ status: 'Testing endpoint: ' + endpoint });
            const res = await axios.post(endpoint, { 
                question: 'What is the total value of our inventory?',
                reportContext: null
            });
            setDebugInfo({
                status: 'Success',
                endpoint,
                responseData: res.data,
                timestamp: new Date().toISOString()
            });
            toast.success(`Test to ${endpoint} successful`);
        } catch (error) {
            setDebugInfo({
                status: 'Error',
                endpoint,
                error: {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                },
                timestamp: new Date().toISOString()
            });
            toast.error(`Test to ${endpoint} failed`);
        }
    };

    const handleRecentQuestionClick = (q) => {
        setQuestion(q);
    };

    return (
        <AdminLayout>
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8 text-center">Ask AI About Your Inventory</h1>
                    
                    {/* Question Form */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="question" className="block text-lg font-medium text-gray-700 mb-2">
                                        Ask a question about your inventory data
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            id="question"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="e.g., What is our current monitor inventory status?"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Ask'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            
                            {/* Recent Questions */}
                            {recentQuestions.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-700">Try one of these questions:</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {recentQuestions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleRecentQuestionClick(q)}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* AI Response */}
                    {loading ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                            </div>
                            <p className="text-center mt-4 text-gray-600">Analyzing inventory data...</p>
                        </div>
                    ) : response && (
                        <div className={`bg-gradient-to-r ${response.is_fallback ? 'from-amber-50 to-orange-50 border-l-4 border-amber-500' : 'from-purple-50 to-indigo-50'} overflow-hidden shadow-sm sm:rounded-lg`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h2 className="text-xl font-semibold text-purple-700">AI Response</h2>
                                    {response.is_fallback && (
                                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-md">
                                            Fallback Response
                                        </span>
                                    )}
                                    {response.error && (
                                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-md">
                                            {response.error}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="prose max-w-none">
                                    <div className={`mb-6 ${response.is_fallback ? 'bg-amber-50' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                                        <p className="text-gray-800">{response.answer}</p>
                                        
                                        {response.is_fallback && (
                                            <div className="mt-4 flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <span>Note: The AI service encountered an issue. This is a fallback response based on predefined data.</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Retry button for fallback responses */}
                                    {response.is_fallback && (
                                        <div className="flex justify-center mb-6">
                                            <button
                                                onClick={() => handleSubmit({ preventDefault: () => {} })}
                                                className="inline-flex items-center px-4 py-2 bg-amber-600 border border-transparent rounded-md font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Key Data Points */}
                                    {response.relevantData && Object.keys(response.relevantData).length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-medium text-purple-600 mb-3">Key Data Points</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Object.entries(response.relevantData).map(([key, value]) => (
                                                    <div key={key} className={`${response.is_fallback ? 'bg-white/80' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
                                                        <p className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ').toUpperCase()}</p>
                                                        <p className="text-xl font-bold text-gray-800">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Response metadata */}
                                    <div className="mt-6 text-xs text-right text-gray-500">
                                        Generated: {response.generatedAt || new Date().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Debug Mode UI */}
                    {debugMode && (
                        <div className="bg-yellow-50 overflow-hidden shadow-sm sm:rounded-lg mb-8 p-6 border border-yellow-200">
                            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Debug Mode</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                    onClick={() => testEndpoint('/api/reports/ask-ai')}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Test OpenAI Endpoint
                                </button>
                                <button
                                    onClick={() => testEndpoint('/api/test-ask-ai')}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Test Mock Endpoint
                                </button>
                                <button
                                    onClick={() => testEndpoint('/api/direct-ask-ai-test')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Test Direct API Integration
                                </button>
                            </div>
                            
                            <div className="mt-2 mb-4 text-sm text-gray-600">
                                <p>• OpenAI endpoint uses real AI with your OpenAI API key</p>
                                <p>• Mock endpoint uses predefined responses for testing</p>
                            </div>
                            
                            {debugInfo && (
                                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
                                    <h3 className="font-bold mb-2">Debug Info:</h3>
                                    <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(debugInfo, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* AI Features Description */}
                    {!response && !loading && !debugMode && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">About AI Inventory Assistant</h2>
                            <p className="text-gray-600 mb-4">
                                Our AI-powered assistant can help you analyze your inventory data quickly. Ask questions in natural language about:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                                <li>Current inventory levels and asset status</li>
                                <li>Financial data related to your inventory</li>
                                <li>Asset utilization and deployment rates</li>
                                <li>Maintenance schedules and status</li>
                                <li>Inventory predictions and recommendations</li>
                            </ul>
                            <p className="text-gray-600 italic">
                                Note: The AI analyzes your inventory data to provide insights but may occasionally provide approximate answers.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AskAI;
