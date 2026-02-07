# OAuth Setup Guide for Chirp

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create a new project** or select an existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain
   - Add authorized redirect URIs:
     - `http://localhost:5173/login`
     - Your production domain + `/login`
   - Click "Create"
   - Copy the **Client ID**

5. **Configure Backend**:
   - Set environment variable: `GOOGLE_CLIENT_ID=your_client_id_here`
   - Or update `Backend/src/main/resources/application.yml`

6. **Configure Frontend**:
   - Create `Frontend/.env` file
   - Add: `VITE_GOOGLE_CLIENT_ID=your_client_id_here`

## Apple OAuth Setup

1. **Go to Apple Developer Portal**: https://developer.apple.com
2. **Create an App ID**:
   - Go to "Certificates, Identifiers & Profiles"
   - Click "Identifiers" > "+" 
   - Select "App IDs" > "App"
   - Enable "Sign In with Apple"

3. **Create a Services ID**:
   - Click "Identifiers" > "+"
   - Select "Services IDs"
   - Enter description and identifier (e.g., `com.yourapp.chirp.web`)
   - Enable "Sign In with Apple"
   - Configure:
     - Domains: `localhost` (dev) and your domain (prod)
     - Return URLs: `http://localhost:5173/login` and production URL
   - Copy the **Service ID** (this is your Client ID)

4. **Create a Key**:
   - Go to "Keys" > "+"
   - Enable "Sign In with Apple"
   - Download the `.p8` key file (keep it secure!)

5. **Configure Backend**:
   - Set environment variable: `APPLE_CLIENT_ID=your_service_id_here`
   - Or update `Backend/src/main/resources/application.yml`

6. **Configure Frontend**:
   - Update `Frontend/.env` file
   - Add: `VITE_APPLE_CLIENT_ID=your_service_id_here`

## Environment Variables Summary

### Backend (`application.yml` or environment variables):
```yaml
oauth:
  google:
    client-id: ${GOOGLE_CLIENT_ID}
  apple:
    client-id: ${APPLE_CLIENT_ID}
```

### Frontend (`.env` file):
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_APPLE_CLIENT_ID=com.yourapp.chirp.web
VITE_API_BASE_URL=http://localhost:8080
```

## Docker Setup

Update `docker-compose.yml` to pass environment variables:

```yaml
backend:
  environment:
    - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    - APPLE_CLIENT_ID=${APPLE_CLIENT_ID}

frontend:
  build:
    args:
      - VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
      - VITE_APPLE_CLIENT_ID=${VITE_APPLE_CLIENT_ID}
```

## Testing

1. **Start the backend**: `./gradlew bootRun`
2. **Start the frontend**: `npm run dev`
3. **Navigate to**: http://localhost:5173/login
4. **Click** "Continue with Google" or "Continue with Apple"
5. **Complete OAuth flow**
6. **You'll be redirected** to the feed page with a JWT token

## How It Works

1. User clicks OAuth button
2. Frontend opens OAuth provider's login page
3. User authenticates with Google/Apple
4. Provider returns an ID token to the frontend
5. Frontend sends ID token to backend `/oauth/google` or `/oauth/apple`
6. Backend verifies the token with the provider
7. Backend creates or finds the user account
8. Backend returns a JWT token
9. Frontend stores JWT and redirects to feed

## Security Notes

- Never commit `.env` files with real credentials
- Use HTTPS in production
- Regularly rotate your OAuth secrets
- Enable 2FA on your Google/Apple developer accounts
