# nicaknots

Nicaknots bikini color customizer built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

## Development

Copy the example environment file and fill in the Firebase web app values from the Firebase console before starting the app.

```sh
cp .env.example .env
npm install
npm run dev
```

## Production Build

```sh
npm run build
```

The static site is generated in `dist`.

## Firebase

The project is linked to the Firebase project `nicaknots`. Google Authentication protects `/admin`, with access limited to Veronica's configured Google account.

Firebase web app config must be supplied as Vite environment variables instead of being committed to the repository. For production deploys, set the `VITE_FIREBASE_*` values in the build environment or in a local `.env` file that is not committed.

```sh
npm run deploy
```
