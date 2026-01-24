# Google Maps Integration Setup

## Overview
The File Complaint page now uses Google Maps to display the detected location after clicking "Detect My Location".

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Secure Your API Key (Recommended)

1. In the Google Cloud Console, click on your API key
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:5173/*` for development, `yourdomain.com/*` for production)
3. Under "API restrictions":
   - Select "Restrict key"
   - Select only "Maps JavaScript API"
4. Click "Save"

### 3. Add API Key to Environment Variables

1. Open the `.env` file in `Backend/Frontend/` directory
2. Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. Save the file

### 4. Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features

- **Interactive Map**: Displays Google Maps with the detected location
- **Marker**: Shows a marker at the exact coordinates
- **Info Window**: Click the marker to see the location address
- **Responsive**: Map adapts to different screen sizes
- **Error Handling**: Shows appropriate messages if the map fails to load

## Usage

1. Navigate to the File Complaint page
2. Click the "Use My Current Location" button
3. Allow browser location permissions when prompted
4. The map will appear showing your detected location with a marker
5. Click the marker to see the address in an info window
6. The latitude and longitude are displayed below the map

## Troubleshooting

### Map Not Showing
- Verify your API key is correctly set in the `.env` file
- Ensure the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for any error messages
- Restart the development server after changing `.env`

### "Error loading Google Maps" Message
- Check if your API key is valid
- Verify API restrictions allow your domain
- Ensure you have billing enabled on your Google Cloud project (required for Maps API)

### Location Not Detected
- Ensure you've granted location permissions to your browser
- Check if your device has location services enabled
- Try using HTTPS (some browsers require secure context for geolocation)

## Cost Considerations

Google Maps JavaScript API has a free tier:
- $200 free credit per month
- First 28,000 map loads per month are free
- After free tier: $7 per 1,000 loads

For most small to medium applications, this should remain within the free tier.
