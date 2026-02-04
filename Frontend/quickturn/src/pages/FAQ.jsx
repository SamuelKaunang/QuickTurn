import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import './Legal.css';
import logoFull from '../assets/logo/Logo full.png';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="faq-item">
            <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                {question}
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {isOpen && <div className="faq-answer"><p>{answer}</p></div>}
        </div>
    );
};

const FAQ = () => {
  return (
    <div className="legal-page">
      <Helmet>
        <title>FAQ - Pertanyaan Umum | QuickTurn</title>
        <meta name="description" content="Jawaban atas pertanyaan umum seputar QuickTurn untuk Mahasiswa dan UMKM." />
      </Helmet>

      <div className="legal-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
        
        <div className="legal-header">
            <img src={logoFull} alt="QuickTurn" style={{ height: '40px', marginBottom: '20px' }} />
            <h1 className="legal-title">Pertanyaan Umum (FAQ)</h1>
            <p className="legal-date">Punya pertanyaan lain? Hubungi quickturn.main@gmail.com</p>
        </div>

        <div className="legal-content">
            <h2>Untuk Mahasiswa (Talent)</h2>
            <FAQItem 
                question="Apakah magang di QuickTurn dibayar?" 
                answer="Ya, sebagian besar proyek di QuickTurn adalah Micro-Internship berbayar (paid tasks). Kami memastikan setiap usaha Talent dihargai dengan adil. Nominal bervariasi tergantung kesulitan proyek." 
            />
            <FAQItem 
                question="Bagaimana cara verifikasi akun sebagai mahasiswa?" 
                answer="Kami mewajibkan verifikasi menggunakan Kartu Tanda Mahasiswa (KTM) atau Email Kampus (.ac.id) aktif untuk menjaga kualitas dan kepercayaan di platform ini. Data ini hanya untuk verifikasi dan aman." 
            />
            <FAQItem 
                question="Apakah saya perlu pengalaman kerja sebelumnya?" 
                answer="Tidak wajib! QuickTurn didesain untuk mahasiswa yang ingin membangun portofolio dari nol. Anda bisa mulai dengan proyek sederhana, namun pastikan Anda memiliki skill dasar yang dibutuhkan proyek tersebut." 
            />
            <FAQItem 
                question="Bagaimana sistem pembayarannya? Apakah aman?" 
                answer="Sangat aman. Kami menggunakan sistem Escrow (Rekening Bersama). Klien menyetor dana di awal ke QuickTurn. Setelah proyek selesai dan disetujui, dana otomatis masuk ke dompet akun Anda dan bisa dicairkan ke bank/e-wallet." 
            />
            <FAQItem 
                question="Apa yang terjadi jika Klien 'menghilang' (ghosting)?" 
                answer="Jangan khawatir. Karena dana sudah di Escrow, jika Klien tidak merespon pengumpulan tugas Anda dalam 3x24 jam, sistem akan otomatis menganggap pekerjaan selesai dan dana cair ke Anda." 
            />

            <h2>Untuk UMKM (Klien)</h2>
            <FAQItem 
                question="Berapa biaya untuk memposting proyek?" 
                answer="Gratis! Anda hanya membayar biaya jasa kepada mahasiswa sesuai budget yang Anda tetapkan, ditambah biaya layanan kecil (service fee) saat transaksi deal." 
            />
            <FAQItem 
                question="Apakah hasil kerja/desain menjadi hak milik saya sepenuhnya?" 
                answer="Ya, mutlak. Setelah pembayaran diteruskan ke Talent, Hak Kekayaan Intelektual (HAKI) atas hasil karya (Logo, Desain, Kode, dll) otomatis beralih sepenuhnya kepada Anda." 
            />
            <FAQItem 
                question="Bagaimana jika hasil kerja tidak sesuai harapan?" 
                answer="Kami memiliki fitur Revisi yang jumlahnya bisa disepakati di awal. Jika hasil akhir tetap jauh dari brief, Anda bisa mengajukan 'Dispute'. Tim admin QuickTurn akan menengahi dan memproses pengembalian dana (refund) jika Talent terbukti wanprestasi." 
            />
            <FAQItem 
                question="Saya gaptek, apakah bisa dibantu membuat brief proyek?" 
                answer="Tentu! Platform kami menyediakan template brief yang mudah diisi. Mahasiswa yang melamar juga biasanya proaktif bertanya detail kebutuhan Anda." 
            />
        </div>
      </div>
    </div>
  );
};

export default FAQ;
