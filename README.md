# FOU (Reown)

FOU (Fomerly Reown) is an e-commerce application with a React Native mobile client, a Vite-based admin dashboard, and an Express/MongoDB API.

## Project Structure

```text
reown/
├── backend/   Express API, MongoDB models, authentication, payments
├── admin/     Vite + React admin dashboard
└── mobile/    Expo Router React Native application
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB
- Clerk account and application
- Cloudinary account for image uploads
- Flutterwave account for payments

For Android or iOS native builds, also install the platform tooling required by Expo.

## Installation

Install dependencies in each application directory:

```bash
cd backend && npm install
cd ../admin && npm install
cd ../mobile && npm install
```

## Environment Variables

Create `backend/.env` with the values used by your environment:

```env
NODE_ENV=development
PORT=3000
DB_URL=mongodb://127.0.0.1:27017/reown
CLIENT_URL=http://localhost:5173

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

INNGEST_SIGNING_KEY=your_inngest_signing_key
ADMIN_EMAIL=admin@example.com

FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

Create `admin/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SENTRY_DSN=your_sentry_dsn
```

Create `mobile/.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
```

The mobile client currently uses `http://localhost:3000/api` by default in `mobile/lib/api.ts`. On a physical device, replace it with a backend URL reachable from that device.

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the admin dashboard in another terminal:

```bash
cd admin
npm run dev
```

Start the mobile app in a third terminal:

```bash
cd mobile
npm start
```

For Expo Go, use `npm run start:expo-go`. The Flutterwave checkout uses the installed React Native WebView dependency:

```bash
cd mobile
npm run build:development
npm start
```

Useful application commands:

```bash
cd backend && npm run seed:products
cd admin && npm run build
cd mobile && npm run lint
```

## Payments

The mobile checkout creates a hosted Flutterwave checkout through `POST /api/payment/flutterwave` and verifies the completed transaction through `POST /api/payment/flutterwave/verify`.

Configure the provider keys before testing checkout. Never commit `.env` files or secret keys.

## Production Builds

Build the admin dashboard with `npm run build` from `admin`. Use the mobile EAS profiles for native builds:

```bash
cd mobile
npm run build:preview
npm run build:production
```

Set production API URLs, Clerk keys, payment keys, redirect URLs, and webhook endpoints in the deployment environment before releasing.
