import { useEffect, useState, type ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { LogIn, ShieldCheck } from 'lucide-react';
import { ADMIN_EMAIL, auth } from './firebase';
import './admin.css';

type AdminAccessGateProps = {
  children: (handleSignOut: () => Promise<void>) => ReactNode;
};

type AccessState = 'checking' | 'signed-out' | 'signing-in' | 'allowed';

const isAllowedAdmin = (user: User) =>
  user.emailVerified
  && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  && user.providerData.some(({ providerId }) => providerId === 'google.com');

const authErrorMessage = (error: unknown) => {
  if (!(error instanceof FirebaseError)) return 'Die Anmeldung ist fehlgeschlagen. Bitte erneut versuchen.';
  if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
    return 'Die Anmeldung wurde abgebrochen.';
  }
  return 'Die Anmeldung ist fehlgeschlagen. Bitte erneut versuchen.';
};

export function AdminAccessGate({ children }: AdminAccessGateProps) {
  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(
    auth,
    (user) => {
      if (!user) {
        setAccessState('signed-out');
        return;
      }

      if (isAllowedAdmin(user)) {
        setError('');
        setAccessState('allowed');
        return;
      }

      setError('Dieses Google-Konto hat keinen Zugriff.');
      setAccessState('signed-out');
      void signOut(auth);
    },
    () => {
      setError('Die Anmeldung konnte nicht geprüft werden.');
      setAccessState('signed-out');
    },
  ), []);

  const handleSignIn = async () => {
    setError('');
    setAccessState('signing-in');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ login_hint: ADMIN_EMAIL, prompt: 'select_account' });

    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, provider);
    } catch (signInError) {
      if (signInError instanceof FirebaseError && signInError.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          setError(authErrorMessage(redirectError));
          setAccessState('signed-out');
        }
        return;
      }
      setError(authErrorMessage(signInError));
      setAccessState('signed-out');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (accessState === 'allowed') return children(handleSignOut);

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-panel" aria-labelledby="admin-login-title">
        <a href="/" className="admin-auth-brand" aria-label="Zur Nicaknots Startseite">NICAKNOTS</a>
        <div className="admin-auth-icon" aria-hidden="true">
          <ShieldCheck size={26} />
        </div>
        <h1 id="admin-login-title">Adminbereich</h1>
        <p>Mit Veronicas Google-Konto anmelden.</p>
        {error && <div className="admin-auth-error" role="alert">{error}</div>}
        <button
          type="button"
          className="admin-auth-button"
          onClick={handleSignIn}
          disabled={accessState === 'checking' || accessState === 'signing-in'}
        >
          <LogIn size={18} />
          <span>
            {accessState === 'checking' && 'Zugriff wird geprüft'}
            {accessState === 'signing-in' && 'Anmeldung läuft'}
            {accessState === 'signed-out' && 'Mit Google anmelden'}
          </span>
        </button>
      </section>
    </main>
  );
}
