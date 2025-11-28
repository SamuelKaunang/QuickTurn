package com.example.QucikTurn.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Method ini yang bakal dipanggil nanti pas user klik "Forgot Password"
    public void sendResetTokenEmail(String toEmail, String token) {
        // Kita set URL endpoint di aplikasi lo buat reset password
        // Asumsi aplikasi jalan di localhost:8080
        String resetUrl = "http://localhost:8080/api/auth/reset-password?token=" + token;

        // Bikin template email HTML biar cakep
        String subject = "Reset Password - QucikTurn";
        String htmlContent = "<h3>Halo, Sobat QucikTurn!</h3>"
                + "<p>Lo baru aja minta reset password ya? Kalau bukan lo, cuekin aja email ini.</p>"
                + "<p>Kalau emang lo yang minta, klik tombol di bawah ini buat ganti password:</p>"
                + "<a href=\"" + resetUrl + "\" style=\"background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Ganti Password Sekarang</a>"
                + "<br><br>"
                + "<p>Link ini cuma berlaku 15 menit ya, bestie!</p>";

        try {
            // MimeMessage itu buat email yang support HTML/Attachment
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // Parameter 'true' artinya ini HTML
            helper.setFrom("qucikturn.bot@gmail.com"); // Samain sama email di properties lo

            mailSender.send(message);
            System.out.println("Email reset password berhasil dikirim ke: " + toEmail);

        } catch (MessagingException e) {
            // Kalau gagal, kita log error-nya
            e.printStackTrace();
            throw new RuntimeException("Gagal ngirim email, bro. Cek koneksi atau settingan SMTP lo.");
        }
    }
}