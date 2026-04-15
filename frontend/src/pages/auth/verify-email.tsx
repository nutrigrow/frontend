import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying...');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('Token tidak ditemukan.');
        return;
      }
      try {
        // Memanggil endpoint backend
        await apiClient.get(`/api/auth/verify-email?token=${token}`);
        setStatus('Email berhasil diverifikasi! Mengalihkan ke login...');
        setTimeout(() => navigate('/sign-in'), 3000);
      } catch (err: any) {
        setStatus(err.response?.data?.message || 'Verifikasi gagal.');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
      <h1>{status}</h1>
    </div>
  );
};

export default VerifyEmail;