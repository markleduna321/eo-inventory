# OpenAI Integration Testing Guide

This guide will help you verify that the OpenAI integration is working correctly in both development and production environments.

## Prerequisites

Before testing, ensure you have:

1. A valid OpenAI API key configured in your `.env` file
2. The correct environment variables set:
   ```
   OPENAI_API_KEY=sk-your-api-key
   OPENAI_MODEL=gpt-4
   OPENAI_TEMPERATURE=0.3
   OPENAI_MAX_TOKENS=500
   OPENAI_MAX_RETRIES=3
   OPENAI_CACHE_TIME=60
   ```

## Test Methods

### 1. Using the Diagnostic Script

The most comprehensive way to test the OpenAI integration is to use the diagnostic script:

```bash
php openai-diagnostic.php
```

This script will:
- Validate your API key
- Test the default model
- Test fallback models if needed
- Check for rate limiting issues
- Provide recommendations

### 2. Basic Connection Test

For a quick connection test:

```bash
php openai-connection-test.php
```

This performs a simple test to verify API connectivity.

### 3. API Endpoint Testing

Use the test endpoints to verify API functionality:

- `/api/test-openai`: Direct OpenAI API test
- `/api/direct-ask-ai-test`: Tests the full integration
- `/api/test-ask-ai`: Uses mock responses (no API call)

### 4. Frontend Testing

To test the frontend integration:

1. Navigate to the AI reports section
2. Enable debug mode if available
3. Try asking questions like:
   - "Which department has the highest number of monitors?"
   - "What is the total value of our inventory?"
   - "How many parts are below the minimum stock level?"

## Common Issues

### Rate Limit Errors

If you encounter "high demand" errors:

1. Check your OpenAI usage dashboard for rate limits
2. Implement a queue system for requests
3. Add exponential backoff for retries

### Timeout Issues

If requests are timing out:

1. Increase the request timeout in the frontend (currently 15s)
2. Simplify the data context sent to the API
3. Use a faster model (e.g., gpt-3.5-turbo)

### Invalid Responses

If responses don't make sense:

1. Check that the inventory data is properly formatted
2. Verify that the system prompts are appropriate
3. Adjust the temperature setting (lower for more deterministic responses)

## Monitoring

Monitor your OpenAI usage through:

1. Laravel logs (`storage/logs/laravel.log`)
2. The OpenAI dashboard (https://platform.openai.com/usage)
3. Custom logging in the `OpenAIService` class

## Testing in Production

When testing in production:

1. Use the test endpoints rather than the full application
2. Start with simple queries that require minimal tokens
3. Monitor API usage closely to avoid unexpected charges
4. Implement rate limiting on your end to prevent abuse

## Fallback Strategy

If OpenAI is consistently unavailable in production:

1. Enable the mock response system by setting `OPENAI_USE_MOCK=true` in .env
2. Modify `app/Services/OpenAIService.php` to return mock responses
3. Add a banner in the UI indicating that responses are simulated

## Need Help?

If you encounter issues that aren't covered here:

1. Check the Laravel logs for detailed error information
2. Verify your OpenAI account status
3. Test with the OpenAI playground to isolate API issues
4. Review the integration code for potential bugs
