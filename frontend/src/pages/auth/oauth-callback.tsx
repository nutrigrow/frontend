import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tokenStorage } from '../../services/api';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 1. Ambil token dari URL (hasil lemparan dari backend)
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // 2. Simpan token ke dalam localStorage
      tokenStorage.setTokens(accessToken, refreshToken);
      
      // 3. Paksa refresh dan kembali ke halaman Home
      // Memakai window.location.replace agar AuthContext melakukan cek sesi (getMe) ulang
      window.location.replace('/dashboard');
    } else {
      // Jika token tidak ada (misal user batal login Google)
      window.location.replace('/sign-in');
    }
  }, [searchParams]);

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748B' 
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* Simple Loading Spinner */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '4px solid var(--color-nutri-green-soft)',
          borderTopColor: 'var(--color-nutri-green)',
          animation: 'spin 1s linear infinite'
        }} />
        <h2>Memproses akun Google kamu...</h2>
        
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    </div>
  );
};

export default OAuthCallback;