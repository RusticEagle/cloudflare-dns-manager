# User API Key Feature - Implementation Summary

## Overview
The Cloudflare DNS Manager now allows users to add their own Cloudflare API key through the Settings page. The API key is stored securely in the browser's localStorage and is sent with each API request.

## Changes Made

### 1. Created API Key Context (`src/contexts/ApiKeyContext.tsx`)
- React context provider to manage the user's API key across the application
- Stores the API key in localStorage for persistence
- Provides `useApiKey()` hook for accessing the API key in components

### 2. Updated Settings Page (`pages/settings.tsx`)
- Integrated with the API key context
- Added password-type input field for secure entry
- Save and Clear buttons for managing the API key
- Success alerts and helpful information about API token usage
- Link to Cloudflare dashboard for obtaining API tokens

### 3. Updated API Routes
- **`pages/api/domains.ts`**: Accepts API key from `x-cf-api-key` header
- **`pages/api/domains/[zoneId]/records.ts`**: Accepts API key from header
- **`pages/api/bulk.ts`**: Accepts API key from header
- All routes fall back to environment variable if user doesn't provide their own key

### 4. Updated useApi Hook (`src/hooks/useApi.ts`)
- Automatically includes the API key from localStorage in all requests
- Adds `x-cf-api-key` header when API key is available

### 5. Updated Frontend Components
- **`pages/domains.tsx`**: Uses API key context and sends it with requests
- **`pages/domains/[id].tsx`**: Uses API key context and sends it with requests
- **`src/components/BulkActionModal.tsx`**: Uses API key context for bulk operations

### 6. Updated App Wrapper (`pages/_app.tsx`)
- Wrapped the entire app with `ApiKeyProvider` to make the context available everywhere

## How It Works

1. **User enters API key**: Users go to the Settings page and enter their Cloudflare API token
2. **Stored locally**: The API key is saved in browser's localStorage
3. **Sent with requests**: All API calls automatically include the API key in the `x-cf-api-key` header
4. **Server uses key**: API routes prioritize the user-provided key over environment variables
5. **Cloudflare integration**: The key is used to authenticate with Cloudflare's API

## Security Notes

- API keys are stored in browser localStorage (client-side only)
- Keys are never stored on the server
- Keys are transmitted via HTTPS headers
- Password-type input field prevents shoulder surfing
- Users can clear their API key at any time

## Usage Instructions

1. Navigate to the Settings page
2. Click the link to get an API token from Cloudflare
3. Paste the API token into the field
4. Click Save
5. The token will be used for all subsequent Cloudflare API calls
6. To remove the token, click Clear

## Backward Compatibility

The system still supports server-side API keys via the `CF_API_TOKEN` environment variable. If a user doesn't provide their own key, the server will use the environment variable as a fallback.
