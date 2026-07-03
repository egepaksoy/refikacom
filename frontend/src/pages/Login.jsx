import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE}/token`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Giriş bilgileri hatalı.');
      }
    } catch (err) {
      setError('Backend sunucusuna bağlanılamadı. Sunucunun açık olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#0B0F19', 
      background: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)',
      fontFamily: 'var(--font-sans)',
      padding: '20px'
    }}>
      {/* Dekoratif Kozmik Parçacıklar */}
      <div style={{ position: 'absolute', right: '10%', top: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,149,110,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: '10%', bottom: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,149,110,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.4)', 
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px', 
        padding: '50px 40px', 
        width: '100%', 
        maxWidth: '440px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Baş Harf Logosu */}
        <div style={{ 
          width: '70px', 
          height: '70px', 
          backgroundColor: 'var(--accent-light)', 
          border: '1.5px solid var(--accent)', 
          borderRadius: '50%', 
          margin: '0 auto 25px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '26px', 
          color: 'var(--accent)', 
          fontWeight: '600', 
          fontFamily: 'var(--font-serif)',
          boxShadow: '0 0 30px rgba(194, 149, 110, 0.15)'
        }}>
          R
        </div>

        <h2 style={{ 
          color: 'white', 
          fontFamily: 'var(--font-serif)', 
          fontSize: '28px', 
          marginBottom: '10px', 
          fontWeight: '400',
          letterSpacing: '-0.01em'
        }}>
          Yönetici Portalı
        </h2>
        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '35px' }}>
          Refika Öncü Portfolyo Yönetimi
        </p>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#FCA5A5', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            fontSize: '13.5px', 
            marginBottom: '25px',
            textAlign: 'left',
            lineHeight: '1.5'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Kullanıcı Adı</label>
            <input 
              type="text" 
              placeholder="Kullanıcı adınızı girin" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ 
                width: '100%',
                padding: '14px 16px', 
                borderRadius: '10px', 
                border: '1.5px solid rgba(255, 255, 255, 0.1)', 
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(194, 149, 110, 0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>Şifre</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ 
                width: '100%',
                padding: '14px 16px', 
                borderRadius: '10px', 
                border: '1.5px solid rgba(255, 255, 255, 0.1)', 
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(194, 149, 110, 0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '10px',
              padding: '14px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              backgroundColor: 'var(--accent)', 
              color: 'var(--primary)', 
              border: 'none', 
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '15.5px',
              transition: 'all 0.25s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Güvenli Giriş Yap'}
          </button>
        </form>

        <div style={{ marginTop: '35px' }}>
          <Link to="/" style={{ color: '#64748B', fontSize: '13.5px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.color='#64748B'}>
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}