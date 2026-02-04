import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Legal.css';
import logoFull from '../assets/logo/Logo full.png';

const RefundPolicy = () => {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Kebijakan Pengembalian Dana (Refund) | QuickTurn</title>
        <meta name="description" content="Kebijakan pengembalian dana (refund) untuk layanan micro-internship di QuickTurn." />
      </Helmet>

      <div className="legal-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
        
        <div className="legal-header">
            <img src={logoFull} alt="QuickTurn" style={{ height: '40px', marginBottom: '20px' }} />
            <h1 className="legal-title">Kebijakan Pengembalian Dana</h1>
            <p className="legal-date">Terakhir diperbarui: 4 Februari 2026</p>
        </div>

        <div className="legal-content">
          <p>QuickTurn berkomitmen untuk menjamin keamanan transaksi bagi Klien (UMKM) dan Talent (Mahasiswa). Kami menggunakan sistem <strong>Escrow (Rekening Bersama)</strong> untuk memastikan dana aman hingga pekerjaan selesai.</p>

          <h2>1. Prinsip Umum</h2>
          <p>Dana yang disetorkan Klien ditahan di rekening Escrow QuickTurn dan hanya akan diteruskan ke Talent setelah:</p>
          <ul>
            <li>Pekerjaan disetujui (Approved) oleh Klien; atau</li>
            <li>Melewati batas waktu konfirmasi otomatis (3x24 jam) tanpa ada komplain dari Klien.</li>
          </ul>
          <p>Setelah dana diteruskan ke Talent, maka <strong>dana tidak dapat dikembalikan (Non-Refundable)</strong>.</p>

          <h2>2. Syarat Pengajuan Refund</h2>
          <p>Klien berhak mengajukan pengembalian dana <strong>sebelum</strong> pekerjaan disetujui, dalam kondisi berikut:</p>
          <ul>
            <li><strong>Talent Tidak Responsif (Ghosting):</strong> Talent tidak merespon pesan atau tidak memberikan update progres selama lebih dari 3x24 jam setelah proyek dimulai.</li>
            <li><strong>Gagal Kirim (Non-Delivery):</strong> Talent gagal mengirimkan hasil pekerjaan sesuai tenggat waktu (deadline) yang disepakati.</li>
            <li><strong>Kualitas Buruk (Low Quality):</strong> Hasil pekerjaan sangat jauh dari instruksi (brief) awal dan Talent menolak atau gagal melakukan revisi yang wajar. Kondisi ini wajib dibuktikan melalui proses Sengketa (Dispute).</li>
            <li><strong>Pembatalan Sepihak:</strong> Talent membatalkan proyek karena alasan pribadi.</li>
          </ul>

          <h2>3. Proses Penyelesaian Sengketa (Dispute)</h2>
          <p>Jika terjadi ketidaksepakatan antara Klien dan Talent:</p>
          <ol>
            <li><strong>Negosiasi Mandiri:</strong> Kami menyarankan pengguna berdiskusi terlebih dahulu di fitur chat.</li>
            <li><strong>Tiket Bantuan:</strong> Jika buntu, laporkan via tombol "Ajukan Masalah" di halaman proyek.</li>
            <li><strong>Mediasi Admin:</strong> Tim QuickTurn akan memeriksa bukti (chat & file) dan mengambil keputusan final apakah dana dikembalikan ke Klien (Refund) atau diteruskan ke Talent.</li>
          </ol>

          <h2>4. Biaya Non-Refundable</h2>
          <p>Dalam kasus Refund yang disetujui, dana pokok proyek akan dikembalikan 100% ke Saldo QuickTurn Klien. Namun, <strong>Biaya Layanan (Service Fee)</strong> dan <strong>Biaya Administrasi Transfer Eksternal</strong> (jika ada) tidak dapat dikembalikan karena sudah digunakan untuk biaya operasional platform & gateway pembayaran.</p>

          <h2>5. Pencairan Dana Refund</h2>
          <p>Dana refund akan masuk ke Saldo Dompet QuickTurn Klien dan dapat digunakan untuk hiring talent lain secara instan, atau ditarik (withdraw) ke rekening bank terdaftar (proses 1-3 hari kerja).</p>

          <h2>6. Kontak</h2>
          <p>Untuk mengajukan klaim refund manual atau bantuan dispute, hubungi <a href="mailto:quickturn.main@gmail.com">quickturn.main@gmail.com</a> dengan subjek "Pengajuan Refund - [ID Proyek]".</p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
