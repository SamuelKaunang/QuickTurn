package com.example.QucikTurn.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final Resend resend;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    // Kirim verification code ke email user untuk reset password
    public void sendVerificationCodeEmail(String toEmail, String code) {
        String subject = "Kode Verifikasi Reset Password - QuickTurn";

        // Template email dengan code yang ditampilkan prominent
        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Reset Password</h2>
                    <p style="color: #666; text-align: center;">Halo, Sobat QuickTurn!</p>
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
                        QuickTurn Team
                    </p>
                </div>
                """
                .formatted(code);

        try {
            CreateEmailOptions createEmailOptions = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(toEmail)
                    .subject(subject)
                    .html(htmlContent)
                    .build();

            CreateEmailResponse response = resend.emails().send(createEmailOptions);
            System.out
                    .println("✅ Verification code berhasil dikirim ke: " + toEmail + " (ID: " + response.getId() + ")");

        } catch (ResendException e) {
            System.err.println("❌ Gagal mengirim email via Resend: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Gagal mengirim email. Silakan coba lagi nanti.");
        }
    }
}