package com.example.QucikTurn.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Resend resend;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    /**
     * Send verification code email for password reset.
     * Uses a professional HTML template with logo and QuickTurn brand colors.
     * Color scheme matches the dashboard: Rose accent (#e11d48), slate backgrounds.
     * 
     * @Async: This method runs in a separate thread to avoid blocking the main
     *         request.
     */
    @Async
    public void sendVerificationCodeEmail(String toEmail, String code) {
        String subject = "Password Reset Verification Code - QuickTurn";

        // Professional email template with QuickTurn brand colors
        // Brand: #e11d48 (rose), Backgrounds: slate tones (#f8fafc, #f1f5f9, #1e293b)
        String htmlContent = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #f8fafc 0%%, #f1f5f9 50%%, #e2e8f0 100%%); padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 10px 40px rgba(0, 0, 0, 0.04); overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.8);">

                                    <!-- Header with Logo - Rose Gradient -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #e11d48 0%%, #be123c 50%%, #9f1239 100%%); padding: 40px 40px 30px 40px; text-align: center;">
                                            <img src="https://quick-turn.vercel.app/logo512.png" alt="QuickTurn Logo" width="72" height="72" style="display: block; margin: 0 auto 20px auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);">
                                            <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Password Reset Request</h1>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 40px; background-color: #ffffff;">
                                            <p style="color: #0f172a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: 500;">
                                                Dear Valued User,
                                            </p>
                                            <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">
                                                We have received a request to reset the password associated with your QuickTurn account.
                                                Please use the verification code below to proceed with your password reset.
                                            </p>

                                            <!-- Verification Code Box - Rose Gradient -->
                                            <div style="background: linear-gradient(135deg, #e11d48 0%%, #be123c 50%%, #9f1239 100%%); border-radius: 12px; padding: 32px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(225, 29, 72, 0.3), 0 4px 12px rgba(225, 29, 72, 0.2);">
                                                <p style="color: rgba(255, 255, 255, 0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 16px 0; font-weight: 600;">Your Verification Code</p>
                                                <span style="font-size: 44px; font-weight: 800; letter-spacing: 14px; color: #ffffff; font-family: 'Courier New', monospace; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">%s</span>
                                            </div>

                                            <!-- Expiry Notice - Rose Accent -->
                                            <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 30px 0;">
                                                <p style="color: #9f1239; font-size: 14px; margin: 0; line-height: 1.5;">
                                                    <strong>⏱ Important:</strong> <span style="color: #64748b;">This verification code will expire in <strong style="color: #0f172a;">15 minutes</strong>.
                                                    Please complete your password reset promptly.</span>
                                                </p>
                                            </div>

                                            <!-- Security Notice - Slate Background -->
                                            <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; margin: 30px 0; border: 1px solid #e2e8f0;">
                                                <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">🔒 Security Notice</p>
                                                <ul style="color: #64748b; font-size: 13px; line-height: 1.9; margin: 0; padding-left: 20px;">
                                                    <li>If you did not request this password reset, please ignore this email.</li>
                                                    <li>Never share this verification code with anyone.</li>
                                                    <li>QuickTurn will never ask for your password via email.</li>
                                                </ul>
                                            </div>

                                            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                                If you have any questions or require assistance, please do not hesitate to contact our support team.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Footer - Light Slate -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 28px 40px; border-top: 1px solid #e2e8f0;">
                                            <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <p style="color: #e11d48; font-size: 18px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.3px;">QuickTurn</p>
                                                        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px 0; font-weight: 500;">Connecting Talent with Opportunity</p>
                                                        <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                                                            © 2026 QuickTurn. All rights reserved.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                </table>

                                <!-- Additional Footer Text -->
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px;">
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px;">
                                            <p style="color: #94a3b8; font-size: 11px; line-height: 1.7; margin: 0;">
                                                This is an automated message from QuickTurn. Please do not reply directly to this email.<br>
                                                If you need assistance, visit our website at <a href="https://quickturn.web.id" style="color: #e11d48; text-decoration: none; font-weight: 600;">quickturn.web.id</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>
                    </table>
                </body>
                </html>
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
            log.info("Verification code sent successfully to: {} (ID: {})", maskEmail(toEmail), response.getId());

        } catch (ResendException e) {
            log.error("Failed to send verification email to: {} - {}", maskEmail(toEmail), e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again later.");
        }
    }

    /**
     * SECURITY: Mask email for logging (e.g., "sam***@gmail.com")
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 3) {
            return local.charAt(0) + "***@" + domain;
        }
        return local.substring(0, 3) + "***@" + domain;
    }
}
