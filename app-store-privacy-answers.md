# App Store Connect Privacy Answers

Use these answers for App Store Connect > App Privacy, based on the current app implementation.

## Data Collection

Question:
Do you or your third-party partners collect data from this app?

Answer:
No, we do not collect data from this app.

## Reasoning

The app stores optional personalization and user-created content locally on the device only:

- Optional display name
- Mood check-in entries
- Saved encouragement IDs
- Personal saved-note text
- Recently seen note IDs
- Journal reflections
- Prayer requests
- Daily reminder hour, if enabled

The app does not transmit this data to the developer, a backend, or a third party.

## Tracking

Question:
Do you or your third-party partners use this app to track users?

Answer:
No.

The app does not use advertising identifiers, analytics SDKs, third-party tracking SDKs, cross-app tracking, or data brokerage.

## Linked To User

Answer:
Not applicable because no data is collected by the developer.

## Data Used For Tracking

Answer:
Not applicable because no data is collected and no tracking occurs.

## Permissions

The app should not request access to:

- Location
- Contacts
- Photos
- Camera
- Microphone
- Bluetooth
- Health
- Calendars
- Reminders
- Local network

The app may request notification permission only when the user turns on the optional daily reminder. The reminder is scheduled locally on the device. The app does not upload push tokens or send notification-related data to the developer.

## Apple Privacy Manifest Alignment

The app-level iOS privacy manifest declares:

- No tracking
- No tracking domains
- No collected data types
- Required-reason APIs for installed React Native and Expo native packages

## Important Submission Note

If future versions add accounts, cloud sync, analytics, remote push messaging, purchases, external forms, email collection, or backend services, these answers must be reviewed and updated before submission.
