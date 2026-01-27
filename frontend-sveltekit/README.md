# Frontend SvelteKit Template

Production-ready SvelteKit frontend with Svelte 5 and authentication.

## Features

- **Svelte 5** with runes ($state, $derived, $effect)
- **SvelteKit 2** with adapter-node
- **TypeScript** for type safety
- **JWT Authentication** with refresh tokens
- **API Client** with automatic token refresh
- **Protected Routes** (dashboard)
- **Docker** ready

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte      # Main layout with navigation
│   ├── +page.svelte        # Home page
│   ├── login/+page.svelte  # Login page
│   ├── register/+page.svelte # Registration page
│   └── dashboard/+page.svelte # Protected dashboard
├── lib/
│   ├── api/
│   │   └── client.ts       # API client for backend
│   └── stores/
│       └── auth.svelte.ts  # Auth store (Svelte 5 runes)
├── app.html                # HTML template
├── app.css                 # Global styles
└── app.d.ts                # TypeScript declarations
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
API_URL=http://localhost:3001   # Backend API URL
```

## Docker

```bash
# Build image
docker build -t frontend-sveltekit .

# Run container
docker run -p 3000:3000 frontend-sveltekit
```

## API Integration

The API client (`src/lib/api/client.ts`) handles:

- Automatic Authorization header injection
- Token refresh on 401 responses
- Standard API response format
- Credentials (cookies) for refresh tokens

## Authentication Flow

1. User logs in via `/login`
2. Backend returns access token + sets refresh token cookie
3. Access token stored in memory (not localStorage)
4. API client adds token to all requests
5. On 401, client tries to refresh token
6. On successful refresh, original request is retried

## Svelte 5 Runes Usage

```typescript
// In auth.svelte.ts
let user = $state<User | null>(null);
let isAuthenticated = $derived(user !== null);

// In components
const auth = getAuthState();
// auth.user, auth.isLoading, auth.isAuthenticated are reactive
```

## Requirements

- Node.js 20+
- Backend running on API_URL
