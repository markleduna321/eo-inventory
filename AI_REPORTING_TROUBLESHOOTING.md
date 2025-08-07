# AI Reporting Troubleshooting Guide

## Overview
This document provides troubleshooting steps for the AI-powered reporting features in the inventory system.

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
  ```
- Check the API logs for any rate limiting or quota issues

### 2. Rate Limiting Issues
If you see a 429 error in the logs, you're being rate-limited by the OpenAI API.

**Solution:**
- Implement a retry mechanism with exponential backoff
- Reduce the frequency of API calls
- Consider upgrading your API tier for higher rate limits

### 3. Empty or Incorrect Responses
This can happen if the data being sent to the API is too large or in an incorrect format.

**Solution:**
- Verify the data preprocessing in the `prepareDataForAI` method
- Check that the JSON data is properly formatted
- Reduce the size of the data being sent to stay within token limits

### 4. Testing the OpenAI Connection
You can use the provided test script to verify your API connection:

```bash
php openai-connection-test.php
```

A successful connection will show:
```
✅ API request successful!
```

### 5. Using the Debug Mode
When the AI service is having issues, you can use the debug mode in the Ask AI interface:

1. Access the debug mode at: `/admin/reports/test-ask-ai`
2. Use the "Test OpenAI Endpoint" and "Test Mock Endpoint" buttons
3. Review the debug information panel for detailed error messages

### 6. Fallback to Mock Responses
The system automatically falls back to mock responses when OpenAI is unavailable. To customize these:

1. Edit the `getFallbackResponse` method in the `ReportController.php`
2. Modify the mock responses in the `/api/test-ask-ai` route in `api.php`

## Logs to Check
When troubleshooting, review these log locations:

1. Laravel logs: `storage/logs/laravel.log`
2. Check browser console for frontend errors
3. API response status codes and error messages

## Contact Support
If issues persist after trying these steps, contact the development team with:

1. The specific error message
2. Steps to reproduce
3. Screenshot of the error
4. Relevant log entries

---

Last Updated: August 7, 2025
