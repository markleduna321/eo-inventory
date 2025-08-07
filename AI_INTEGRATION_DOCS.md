# OpenAI Integration for Inventory Management System

This document provides details on the OpenAI integration for the AI reporting feature in the inventory management system.

## Overview

The system integrates with OpenAI's API to provide AI-powered insights on inventory data. The integration allows users to:

1. Ask natural language questions about inventory data
2. Receive AI-enhanced reports with insights and recommendations
3. Get predictive analytics based on historical inventory data

## Configuration

The OpenAI integration is configured through environment variables in the `.env` file:

```
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=500
OPENAI_MAX_RETRIES=3
OPENAI_CACHE_TIME=60
```

### Configuration Options

| Variable | Description | Default Value |
|----------|-------------|---------------|
| OPENAI_API_KEY | Your OpenAI API key | Required |
| OPENAI_MODEL | Primary model to use | gpt-4 |
| OPENAI_TEMPERATURE | Temperature setting (0-1) | 0.3 |
| OPENAI_MAX_TOKENS | Maximum tokens in response | 500 |
| OPENAI_MAX_RETRIES | Number of retry attempts | 3 |
| OPENAI_CACHE_TIME | Cache duration in minutes | 60 |

## Architecture

The OpenAI integration uses a service-based architecture:

1. **OpenAIService**: A dedicated service class that handles API communication, retries, fallbacks, and caching
2. **ReportController**: Uses the OpenAIService for generating AI responses
3. **Frontend Components**: React components that display AI responses and handle error states

## Fallback Mechanism

The system implements several fallback mechanisms to ensure robustness:

1. **Model Fallbacks**: If the primary model fails, the system tries alternate models
2. **Response Caching**: Successful responses are cached to reduce API calls and provide quick responses
3. **Error Handling**: Comprehensive error handling with specific error messages
4. **Rate Limiting**: Automatic handling of rate limit errors with exponential backoff

## Troubleshooting

### Common Issues and Solutions

#### "The AI service is currently experiencing high demand"

This message indicates rate limiting on the OpenAI API. Solutions:

1. Wait a few minutes and try again
2. Check your OpenAI account usage and limits
3. Implement a queue system for API requests

#### Slow Response Times

If responses are taking too long:

1. Reduce the complexity of queries
2. Check network connectivity
3. Consider using a faster model (e.g., GPT-3.5-Turbo instead of GPT-4)
4. Increase the request timeout value

#### Invalid Responses

If responses don't make sense:

1. Check that the prompt construction is appropriate
2. Verify that inventory data is being properly formatted
3. Adjust the temperature setting (lower for more focused responses)

## Diagnostic Tools

The system includes diagnostic tools for troubleshooting:

1. **openai-connection-test.php**: Simple connectivity test
2. **openai-diagnostic.php**: Comprehensive diagnostic tool

Run these tools from the command line:

```
php openai-connection-test.php
php openai-diagnostic.php
```

## Development Best Practices

When working with the OpenAI integration:

1. Always handle API errors gracefully with user-friendly messages
2. Implement caching to reduce API calls
3. Use appropriate system prompts to get consistent responses
4. Keep data context concise to minimize token usage
5. Monitor API usage to avoid unexpected charges

## Monitoring and Logging

The system logs important events related to the OpenAI API:

- API requests with question context
- Successful responses with model and token usage
- Error responses with detailed error information
- Fallback mechanisms being triggered

Logs are available in the standard Laravel log files.

## Future Improvements

Planned enhancements to the OpenAI integration:

1. Implement a queue system for API requests
2. Add streaming responses for better user experience
3. Improve prompt engineering for more accurate responses
4. Add more sophisticated caching mechanisms
5. Implement semantic caching for similar questions
