# Firebase Setup Guide

This guide explains how to set up Firebase for both local development and deployment.

## Quick Start

### Local Development

1. **Get your Firebase service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `recycle-buddy-e82ea`
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in the `backend/` directory

2. **Create a `.env` file in the `backend/` directory:**
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

3. **That's it!** Firebase will automatically initialize when you start the server.

### Deployment (Cloud Run, Cloud Functions, etc.)

For deployment, you have two options:

#### Option 1: Environment Variable (Recommended)

Set the `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable with your entire service account JSON as a string:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"recycle-buddy-e82ea",...}'
```

**For Cloud Run:**
```bash
gcloud run services update your-service-name \
  --set-env-vars="FIREBASE_SERVICE_ACCOUNT_JSON=$(cat serviceAccountKey.json | jq -c)"
```

**For Cloud Functions:**
Add to your `functions/.env` or set in the Cloud Functions console.

#### Option 2: Application Default Credentials (Easiest)

If you're deploying to Google Cloud Platform (Cloud Run, Cloud Functions, GCE, etc.), you can use Application Default Credentials. This is the **easiest** method:

1. **No configuration needed!** Just make sure your Cloud resource has the Firebase Admin SDK service account attached.
2. Firebase will automatically use the service account attached to your Cloud resource.

**For Cloud Run:**
- The service account is automatically available
- Just set `FIREBASE_PROJECT_ID=recycle-buddy-e82ea` (optional, defaults from `.firebaserc`)

**For Cloud Functions:**
- Functions automatically have access to the Firebase Admin SDK
- No additional setup needed

## Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
# Choose ONE of the following methods:

# Method 1: Service Account File Path (for local development)
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Method 2: Service Account JSON String (for deployment)
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Method 3: Application Default Credentials (for Cloud Run, Cloud Functions)
# No configuration needed - just set project ID (optional)
# FIREBASE_PROJECT_ID=recycle-buddy-e82ea
```

## Initialization Priority

Firebase initialization tries methods in this order:

1. **Service Account File** (`FIREBASE_SERVICE_ACCOUNT_PATH`) - Best for local development
2. **Service Account JSON** (`FIREBASE_SERVICE_ACCOUNT_JSON`) - Best for deployment
3. **Application Default Credentials** - Automatic in GCP environments

## Troubleshooting

### "Firebase Admin initialization failed"

**For Local Development:**
- Make sure `serviceAccountKey.json` exists in the `backend/` directory
- Check that `FIREBASE_SERVICE_ACCOUNT_PATH` points to the correct file
- Verify the service account key is valid

**For Deployment:**
- Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is set correctly (entire JSON as a string)
- OR ensure your Cloud resource has the Firebase Admin SDK service account attached
- Check that `FIREBASE_PROJECT_ID` matches your Firebase project

### "Firebase endpoints will not work"

This means Firebase wasn't initialized. Check the console logs for initialization errors and follow the setup steps above.

## Security Notes

⚠️ **Important:**
- Never commit `serviceAccountKey.json` to git (it's already in `.gitignore`)
- Never commit `.env` files with secrets
- For deployment, prefer Application Default Credentials when possible
- If using environment variables, ensure they're encrypted in your deployment platform

## Testing Firebase Connection

After setup, start your server and check the console. You should see:
```
✓ Firebase Admin initialized with service account file
```

If you see this, Firebase is ready to use!
