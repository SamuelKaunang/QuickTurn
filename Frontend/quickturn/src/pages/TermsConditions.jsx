import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Legal.css';
import logoFull from '../assets/logo/Logo full.png';

const TermsConditions = () => {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Syarat & Ketentuan | QuickTurn</title>
        <meta name="description" content="Syarat dan ketentuan penggunaan platform QuickTurn untuk Mahasiswa dan UMKM." />
      </Helmet>

      <div className="legal-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
        
        <div className="legal-header">
            <img src={logoFull} alt="QuickTurn" style={{ height: '40px', marginBottom: '20px' }} />
            <h1 className="legal-title">Syarat & Ketentuan</h1>
            <p className="legal-date">Terakhir diperbarui: 4 Februari 2026</p>
        </div>

        <div className="legal-content">
          <p>Selamat datang di QuickTurn. Harap membaca syarat dan ketentuan ini dengan saksama sebelum menggunakan layanan kami.</p>

          <h2>1. Definisi</h2>
          <p>"Platform" merujuk pada situs web dan layanan QuickTurn.</p>
          <p>"Talent" merujuk pada mahasiswa atau individu yang menawarkan jasa.</p>
          <p>"Klien" atau "UMKM" merujuk pada individu atau entitas bisnis yang menggunakan jasa Talent.</p>

          <h2>2. Akun Pengguna</h2>
          <ul>
            <li>Anda bertanggung jawab penuh atas keamanan akun dan kata sandi Anda.</li>
            <li>Anda wajib memberikan data yang akurat, lengkap, dan terbaru saat pendaftaran.</li>
            <li>QuickTurn berhak menonaktifkan akun yang melanggar kebijakan komunitas.</li>
          </ul>

          <h2>3. Layanan Micro-Internship</h2>
          <p>QuickTurn bertindak sebagai perantara yang menghubungkan Talent dengan Klien. Kami tidak bertanggung jawab langsung atas hasil kerja Talent, namun kami menyediakan mekanisme penyelesaian sengketa (dispute resolution) yang adil.</p>

          <h2>4. Pembayaran & Biaya</h2>
          <ul>
            <li>Semua pembayaran proyek dilakukan melalui sistem escrow QuickTurn untuk keamanan kedua belah pihak.</li>
            <li>Dana akan diteruskan ke Talent setelah pekerjaan disetujui oleh Klien.</li>
            <li>QuickTurn mengenakan biaya layanan (service fee) yang transparan pada setiap transaksi.</li>
          </ul>

          <h2>5. Kekayaan Intelektual (HAKI)</h2>
          <p>Sesuai dengan <strong>UU No. 28 Tahun 2014 tentang Hak Cipta</strong>:</p>
          <ul>
            <li>Talent menjamin bahwa semua hasil karya yang diserahkan adalah <strong>karya asli (orisinal)</strong> dan tidak melanggar hak cipta pihak ketiga manapun.</li>
            <li>Kepemilikan Hak Ekonomi atas hasil karya beralih sepenuhnya kepada Klien setelah pembayaran lunas dan pekerjaan disetujui.</li>
            <li>QuickTurn tidak bertanggung jawab atas pelanggaran HAKI yang dilakukan oleh Talent, namun kami akan menindak tegas (banned) pengguna yang terbukti melakukan plagiarisme.</li>
          </ul>

          <h2>6. Larangan & Konten Terlarang (UU ITE)</h2>
          <p>Pengguna dilarang memposting konten yang melanggar hukum di Indonesia, termasuk namun tidak terbatas pada: perjudian, pornografi, ujaran kebencian (SARA), dan produk ilegal. Kami berhak menghapus konten ("Takedown") dan melaporkan ke pihak berwenang sesuai <strong>Permenkominfo No. 5 Tahun 2020</strong>.</p>
          
          <h2>7. Status Hubungan Kerja & Pajak</h2>
          <ul>
            <li>Hubungan antara Klien dan Talent adalah hubungan <strong>Kemitraan/Freelance</strong>, bukan hubungan kerja antara Pengusaha dan Karyawan.</li>
            <li>Talent bertanggung jawab sepenuhnya untuk melaporkan dan membayar Pajak Penghasilan (PPh) sendiri sesuai peraturan perundang-undangan perpajakan yang berlaku di Indonesia.</li>
          </ul>

          <h2>8. Perubahan Ketentuan</h2>
          <p>Kami dapat mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui email atau notifikasi di platform.</p>

          <h2>9. Kontak</h2>
          <p>Jika ada pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami di <a href="mailto:quickturn.main@gmail.com">quickturn.main@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
