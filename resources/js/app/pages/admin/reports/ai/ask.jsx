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
            
            // Use the real endpoint directly - OpenAI integration
            const res = await axios.post('/api/reports/ask-ai', { 
                question,
                reportContext: null
            });
            console.log('API response:', res.data);
            setResponse(res.data);
            
            // Add to recent questions if not already there
            if (!recentQuestions.includes(question)) {
                setRecentQuestions(prev => [question, ...prev.slice(0, 4)]);
            }
            
            toast.success('AI response generated');
            
            // Only use test endpoint if there's an issue with OpenAI
            // and only in debug mode
            if (debugMode && res.data.answer && res.data.answer.includes('could not process')) {
                try {
                    console.log('Fallback to test endpoint due to OpenAI issue');
                    const testRes = await axios.post('/api/test-ask-ai', { 
                        question,
                        reportContext: null
                    });
                    console.log('Test endpoint response:', testRes.data);
                    setResponse(testRes.data);
                    toast.info('Using test response as fallback');
                } catch (testError) {
                    console.warn('Test endpoint also failed:', testError);
                }
            }
        } catch (error) {
            console.error('Error asking AI:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });
            toast.error(`Failed to get a response: ${error.message}`);
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
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4 text-purple-700 border-b pb-2">AI Response</h2>
                                
                                <div className="prose max-w-none">
                                    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-gray-800">{response.answer}</p>
                                    </div>
                                    
                                    {/* Key Data Points */}
                                    {response.relevantData && Object.keys(response.relevantData).length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-medium text-purple-600 mb-3">Key Data Points</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Object.entries(response.relevantData).map(([key, value]) => (
                                                    <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ').toUpperCase()}</p>
                                                        <p className="text-xl font-bold text-gray-800">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
