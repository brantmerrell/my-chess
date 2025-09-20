import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lichessAuth } from '../../services/lichess/auth';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || 'Authorization failed');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Missing authorization parameters');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        const success = await lichessAuth.handleCallback(code, state);

        if (success) {
          setStatus('success');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setStatus('error');
          setErrorMessage('Failed to complete authentication');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('An error occurred during authentication');
        console.error('Auth callback error:', err);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'monospace'
    }}>
      {status === 'processing' && (
        <>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>
            Completing authentication...
          </div>
          <div style={{ fontSize: '48px' }}>♔</div>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '24px', color: 'green', marginBottom: '20px' }}>
            Authentication successful!
          </div>
          <div style={{ fontSize: '16px' }}>Redirecting...</div>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '24px', color: 'red', marginBottom: '20px' }}>
            Authentication failed
          </div>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>
            {errorMessage}
          </div>
          <div style={{ fontSize: '14px' }}>Redirecting to home...</div>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
