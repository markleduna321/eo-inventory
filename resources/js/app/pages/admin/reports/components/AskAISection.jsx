import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AskAISection = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [recentQuestions] = useState([
        'What is the total value of our inventory by category?',
        'Which location has the highest asset utilization rate?',
        'How many devices are over 3 years old and due for replacement?',
        'What are our top 3 most expensive asset categories?',
        'Which brands do we use most and what are their total values?',
        'How many parts are below minimum stock levels?',
        'What is our average cost per user for IT assets?',
        'Which departments have the most pending device requests?'
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
            
            const res = await axios.post('/api/reports/ask-ai', { 
                question,
                reportContext: null
            }, {
                timeout: 15000
            });
            
            console.log('API response:', res.data);
            
            if (res.data && typeof res.data.answer === 'string') {
                setResponse(res.data);
                
                if (res.data.error === 'rate_limit_exceeded') {
                    toast.warning('AI service is experiencing high demand. Try again shortly.');
                } else if (res.data.is_fallback) {
                    if (res.data.enhanced) {
                        toast.info('Using enhanced fallback analysis');
                    } else {
                        toast.info('Using basic fallback response (AI service unavailable)');
                    }
                } else {
                    if (res.data.enhanced) {
                        toast.success('Enhanced AI analysis complete!');
                    } else {
                        toast.success('AI response generated');
                    }
                }
            } else {
                throw new Error('Received an invalid response format');
            }
        } catch (error) {
            console.error('Error asking AI:', error);
            
            const isTimeout = error.code === 'ECONNABORTED' || 
                             (error.message && error.message.includes('timeout'));
            
            if (isTimeout) {
                toast.error('AI service took too long to respond. Please try again.');
                setResponse({
                    answer: 'The AI service took too long to respond. This might be due to high demand or complex data processing. Please try again or simplify your question.',
                    relevantData: [],
                    error: 'timeout',
                    is_fallback: true,
                    generatedAt: new Date().toLocaleString()
                });
            } else if (error.response?.status === 429) {
                toast.error('AI service rate limit reached. Please try again later.');
                setResponse({
                    answer: 'The AI service is currently experiencing high demand. Please try again in a few moments.',
                    relevantData: [],
                    error: 'rate_limit_exceeded',
                    is_fallback: true,
                    generatedAt: new Date().toLocaleString()
                });
            } else {
                toast.error(`Failed to get a response: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRecentQuestionClick = (q) => {
        setQuestion(q);
        if (!isExpanded) {
            setIsExpanded(true);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-md p-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Ask AI About Your Inventory</h2>
                        <p className="text-sm text-gray-600">Get instant insights from your inventory data</p>
                    </div>
                </div>
                
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg 
                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            
            {/* Quick Questions (Always Visible) */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</h3>
                <div className="flex flex-wrap gap-2">
                    {recentQuestions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleRecentQuestionClick(q)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Expanded Section */}
            {isExpanded && (
                <div className="space-y-4 border-t pt-4">
                    {/* Question Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="flex">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                placeholder="Ask any question about your inventory..."
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Ask AI'
                                )}
                            </button>
                        </div>
                    </form>
                    
                    {/* AI Response */}
                    {response && (
                        <div className={`rounded-lg border-l-4 p-4 ${
                            response.is_fallback 
                                ? 'bg-amber-50 border-amber-400' 
                                : response.enhanced
                                ? 'bg-green-50 border-green-400'
                                : 'bg-purple-50 border-purple-400'
                        }`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {response.enhanced ? 'Enhanced AI Analysis' : 'AI Response'}
                                </h3>
                                <div className="flex gap-2">
                                    {response.enhanced && (
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                            Enhanced
                                        </span>
                                    )}
                                    {response.is_fallback && (
                                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                                            Fallback
                                        </span>
                                    )}
                                    {response.model && (
                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                                            {response.model}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="prose prose-sm max-w-none">
                                <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{response.answer}</p>
                            </div>
                            
                            {/* Token Usage (for debugging) */}
                            {response.token_usage && (
                                <div className="text-xs text-gray-500 mb-3">
                                    Tokens used: {response.token_usage.total_tokens || 'N/A'}
                                </div>
                            )}
                            
                            {/* Key Data Points */}
                            {response.relevantData && Object.keys(response.relevantData).length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-xs font-medium text-gray-500 mb-2">Key Metrics:</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {Object.entries(response.relevantData).map(([key, value]) => (
                                            <div key={key} className="bg-white p-2 rounded border text-center">
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </p>
                                                <p className="text-sm font-bold text-gray-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Generated: {new Date(response.generatedAt).toLocaleString()}
                                    {response.enhanced && ' • Using comprehensive data analysis'}
                                </p>
                                
                                <div className="flex gap-2">
                                    {response.is_fallback && (
                                        <button
                                            onClick={() => handleSubmit({ preventDefault: () => {} })}
                                            className="inline-flex items-center px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                                        >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Retry
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(response.answer);
                                            toast.success('Response copied to clipboard');
                                        }}
                                        className="inline-flex items-center px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AskAISection;
