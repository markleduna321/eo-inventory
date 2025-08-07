# AI Reporting Troubleshooting Guide

## Overview
This document provides troubleshooting steps for the AI-powered reporting features in the inventory system.

## Production-Specific Issues

### "The AI service is currently experiencing high demand" Error
This error usually indicates rate limiting or connectivity issues with the OpenAI API in production.

**Quick Fix:**
1. Enable fallback responses in `.env`:
   ```
   OPENAI_USE_FALLBACK=true
   ```
   This will use predefined responses instead of calling the API.

2. Run the production diagnostic tool:
   ```bash
   php prod-ai-diagnostic.php
   ```

3. Check for rate limiting or network issues in the diagnostic output.

### Production Performance Issues
If responses are slow or timing out in production:

**Solution:**
1. Increase retry attempts and timeouts:
   ```
   OPENAI_MAX_RETRIES=5
   ```

2. Consider switching to a faster model with higher rate limits:
   ```
   OPENAI_MODEL=gpt-3.5-turbo
   ```

3. Increase caching duration to reduce API calls:
   ```
   OPENAI_CACHE_TIME=1440  # 24 hours
   ```

### Network/Firewall Issues in Production
If your production server cannot connect to the OpenAI API:

1. Verify outbound connections:
   ```bash
   curl -I https://api.openai.com
   ```

2. Check if you need to configure a proxy for outbound connections.

3. Verify your server has OpenSSL support enabled.

## Common Issues and Solutions

### 1. "this is in the production" Error
This error occurs when the OpenAI API response fails to process correctly or returns an unexpected response format.

**Solution:**
- Verify the OpenAI API key is correctly set in the `.env` file
- Ensure the following environment variables are properly configured:
  ```
  OPENAI_API_KEY=your_api_key_here
  OPENAI_MODEL=gpt-4
  OPENAI_TEMPERATURE=0.3
  OPENAI_MAX_TOKENS=500
  OPENAI_MAX_RETRIES=3
  OPENAI_CACHE_TIME=60
  OPENAI_USE_FALLBACK=false
  ```
- Check the API logs for any rate limiting or quota issues

### 2. Rate Limiting Issues
If you see a 429 error in the logs, you're being rate-limited by the OpenAI API.

**Solution:**
- Our enhanced system now includes automatic retry with exponential backoff
- The system will try multiple models if one fails
- To further reduce rate limiting issues:
  - Increase `OPENAI_CACHE_TIME` to cache responses longer
  - Set `OPENAI_USE_FALLBACK=true` during high-traffic periods

### 3. Empty or Incorrect Responses
This can happen if the data being sent to the API is too large or in an incorrect format.

**Solution:**
- Verify the data preprocessing in the `prepareDataForAI` method
- Check that the JSON data is properly formatted
- Reduce the size of the data being sent to stay within token limits

### 4. Testing the OpenAI Connection
You can use the provided test scripts to verify your API connection:

**Basic test:**
```bash
php openai-connection-test.php
```

**Comprehensive diagnostics:**
```bash
php openai-diagnostic.php
```

**Production diagnostics:**
```bash
php prod-ai-diagnostic.php
```

### 5. Using the Debug Mode
When the AI service is having issues, you can use the debug mode in the Ask AI interface:

1. Access the debug mode at: `/admin/reports/test-ask-ai`
2. Use the "Test OpenAI Endpoint" and "Test Mock Endpoint" buttons
3. Review the debug information panel for detailed error messages

### 6. Fallback to Mock Responses
The system automatically falls back to mock responses when OpenAI is unavailable if `OPENAI_USE_FALLBACK=true`.

To customize the fallback responses:
1. Edit the `getFallbackResponse` method in the `OpenAIService.php`
2. Modify the mock responses in the `/api/test-ask-ai` route in `api_test.php`

## After Making Changes

1. Clear the Laravel cache:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

2. Test the AI functionality with a simple question

3. Check the Laravel logs for any remaining errors:
   ```bash
   tail -n 100 storage/logs/laravel.log
   ```

## Logs to Check
When troubleshooting, review these log locations:

1. Laravel logs: `storage/logs/laravel.log`
2. Check browser console for frontend errors
3. API response status codes and error messages
4. Search for OpenAI-related errors:
   ```bash
   grep -i openai storage/logs/laravel.log | tail -n 50
   ```

## Contact Support
If issues persist after trying these steps, contact the development team with:

1. The specific error message
2. Steps to reproduce
3. Screenshot of the error
4. Relevant log entries
5. Output from the diagnostic tools

---

Last Updated: August 7, 2025
