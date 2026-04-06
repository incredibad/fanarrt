import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { api } from '../api'

export default function LoginPage({ onComplete }) {
  const [step, setStep] = useState('credentials') // 'credentials' | 'totp'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const totpRef = useRef(null)

  useEffect(() => {
    if (step === 'totp') totpRef.current?.focus()
  }, [step])

  const handleCredentials = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(username, password)
      if (res.requiresTotp) {
        setStep('totp')
      } else {
        onComplete()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTotp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.verifyLoginTotp(totpCode)
      onComplete()
    } catch (err) {
      setError(err.message)
      setTotpCode('')
      totpRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.svg" alt="Fanarrt" style={{ height: 44, width: 'auto', flexShrink: 0 }} />
          <div className="auth-app-name">Fanarrt</div>
        </div>
        <div className="auth-app-sub">{step === 'totp' ? 'Two-factor authentication' : 'Sign in to continue'}</div>

        <div className="auth-divider" />

        {step === 'credentials' ? (
          <form onSubmit={handleCredentials} className="auth-form">
            <div className="form-field">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your username"
                autoFocus
                autoComplete="username"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="pw-wrap">
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              disabled={loading}
            >
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="auth-form">
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.6 }}>
              Enter the 6-digit code from your authenticator app.
            </p>
            <div className="form-field">
              <label className="form-label">Authenticator Code</label>
              <input
                ref={totpRef}
                className="form-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9 ]*"
                maxLength={7}
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                autoComplete="one-time-code"
                required
                style={{ letterSpacing: '0.2em', fontSize: 20, textAlign: 'center' }}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              disabled={loading || totpCode.length < 6}
            >
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Verifying…</> : 'Verify'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={() => { setStep('credentials'); setError(''); setTotpCode('') }}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
