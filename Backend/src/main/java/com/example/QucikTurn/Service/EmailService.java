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

    // Kirim verification code ke email user untuk reset password
    public void sendVerificationCodeEmail(String toEmail, String code) {
        String subject = "Kode Verifikasi Reset Password - QucikTurn";

        // Template email dengan code yang ditampilkan prominent
        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Reset Password</h2>
                    <p style="color: #666; text-align: center;">Halo, Sobat QucikTurn!</p>
                    <p style="color: #666; text-align: center;">Gunakan kode verifikasi di bawah ini untuk reset password kamu:</p>

                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white;">%s</span>
                    </div>

                    <p style="color: #999; font-size: 12px; text-align: center;">
                        ⚠️ Kode ini berlaku selama 15 menit.
                    </p>
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Jika kamu tidak merasa meminta reset password, abaikan email ini.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #bbb; font-size: 11px; text-align: center;">
                        QucikTurn Team
                    </p>
                </div>
                """
                .formatted(code);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("qucikturn.bot@gmail.com");

            mailSender.send(message);
            System.out.println("✅ Verification code berhasil dikirim ke: " + toEmail);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Gagal mengirim email. Cek koneksi atau settingan SMTP.");
        }
    }
}