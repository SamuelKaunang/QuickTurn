import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Legal.css';
import logoFull from '../assets/logo/Logo full.png';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Kebijakan Privasi | QuickTurn</title>
        <meta name="description" content="Kebijakan privasi QuickTurn. Kami melindungi data Mahasiswa dan UMKM Anda." />
      </Helmet>

      <div className="legal-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
        
        <div className="legal-header">
            <img src={logoFull} alt="QuickTurn" style={{ height: '40px', marginBottom: '20px' }} />
            <h1 className="legal-title">Kebijakan Privasi</h1>
            <p className="legal-date">Terakhir diperbarui: 4 Februari 2026</p>
        </div>

        <div className="legal-content">
          <p>Di QuickTurn, privasi Anda adalah prioritas kami. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.</p>

          <h2>1. Informasi yang Kami Kumpulkan</h2>
          <ul>
            <li><strong>Informasi Akun:</strong> Nama, alamat email, nomor telepon, universitas (untuk mahasiswa), dan detail bisnis (untuk UMKM).</li>
            <li><strong>Data Transaksi:</strong> Detail pembayaran dan riwayat proyek.</li>
            <li><strong>Data Aktivitas:</strong> Log penggunaan, alamat IP, dan interaksi Anda dengan platform.</li>
          </ul>

          <h2>2. Penggunaan Informasi</h2>
          <p>Kami menggunakan data Anda untuk:</p>
          <ul>
            <li>Memverifikasi identitas dan kredibilitas pengguna (KYC sederhana).</li>
            <li>Memproses transaksi dan pembayaran.</li>
            <li>Mencocokkan Talent dengan proyek yang relevan.</li>
            <li>Mengirimkan pembaruan layanan dan notifikasi penting.</li>
          </ul>

          <h2>3. Berbagi Informasi</h2>
          <p>Kami tidak akan pernah menjual data pribadi Anda ke pihak ketiga. Kami hanya membagikan data kepada:</p>
          <ul>
            <li>Mitra pembayaran (Payment Gateway) untuk memproses transaksi.</li>
            <li>Pihak berwenang jika diwajibkan oleh hukum yang berlaku di Indonesia.</li>
          </ul>

          <h2>4. Keamanan Data</h2>
          <p>Kami menerapkan standar keamanan industri, termasuk enkripsi SSL/TLS, untuk melindungi data Anda selama transmisi dan penyimpanan.</p>

          <h2>5. Hak Subjek Data (Sesuai UU PDP)</h2>
          <p>Sebagai pemilik data pribadi, Anda memiliki hak untuk:</p>
          <ul>
            <li><strong>Akses:</strong> Meminta salinan data pribadi yang kami simpan tentang Anda.</li>
            <li><strong>Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat.</li>
            <li><strong>Penghapusan:</strong> Meminta penghapusan akun dan data pribadi (Right to be Forgotten), kecuali data yang wajib disimpan untuk kepatuhan hukum/finansial.</li>
            <li><strong>Portabilitas:</strong> Meminta data Anda dalam format yang umum digunakan.</li>
          </ul>

          <h2>6. Penyimpanan Data (Data Retention)</h2>
          <p>Kami menyimpan data pribadi Anda selama akun Anda aktif. Data transaksi keuangan akan disimpan minimal 5 (lima) tahun sesuai ketentuan perpajakan dan hukum yang berlaku di Indonesia.</p>

          <h2>7. Cookies & Pelacak</h2>
          <p>Kami menggunakan cookies untuk meningkatkan pengalaman pengguna, menyimpan preferensi login, dan menganalisis trafik situs.</p>

          <h2>8. Hubungi Kami</h2>
          <p>Untuk pertanyaan seputar privasi data, silakan email ke <a href="mailto:quickturn.main@gmail.com">quickturn.main@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
