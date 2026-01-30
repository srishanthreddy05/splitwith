package com.splittrip.backend.service;

import java.io.IOException;

import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * Brevo Email Service: Send transactional emails via Brevo API.
 * 
 * Documentation: https://developers.brevo.com/reference/sendtransacemail
 * 
 * Supports:
 * - OTP emails
 * - Welcome emails
 * - Password reset emails
 */
@Service
@Slf4j
public class BrevoEmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    /**
     * Send OTP email via Brevo.
     * 
     * @param recipientEmail Email address to send OTP to
     * @param otpCode 6-digit OTP code
     * @throws IOException If email sending fails
     */
    public void sendOtpEmail(String recipientEmail, String otpCode) throws IOException {
        String subject = "Your SplitWith OTP Code";
        String htmlContent = buildOtpEmailHtml(otpCode);

        sendEmail(recipientEmail, subject, htmlContent);
        log.info("OTP email sent successfully to: {}", recipientEmail);
    }

    /**
     * Send email via Brevo API.
     * 
     * @param recipientEmail Recipient email address
     * @param subject Email subject
     * @param htmlContent HTML content of the email
     * @throws IOException If API call fails
     */
    private void sendEmail(String recipientEmail, String subject, String htmlContent) throws IOException {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(BREVO_API_URL);

            // Set headers
            httpPost.setHeader("accept", "application/json");
            httpPost.setHeader("content-type", "application/json");
            httpPost.setHeader("api-key", brevoApiKey);

            // Build JSON request body
            String jsonBody = buildBrevoJsonPayload(recipientEmail, subject, htmlContent);
            httpPost.setEntity(new StringEntity(jsonBody));

            // Execute request
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getCode();
                
                if (statusCode >= 200 && statusCode < 300) {
                    log.info("Email sent successfully via Brevo. Status: {}", statusCode);
                } else {
                    String responseBody = new String(response.getEntity().getContent().readAllBytes());
                    log.error("Brevo API error. Status: {}, Response: {}", statusCode, responseBody);
                    throw new IOException("Failed to send email via Brevo. Status: " + statusCode);
                }
            }
        }
    }

    /**
     * Build Brevo API JSON payload.
     * 
     * Example:
     * {
     *   "sender": { "name": "SplitWith Team", "email": "splitwith@gmail.com" },
     *   "to": [{ "email": "user@example.com" }],
     *   "subject": "Your OTP Code",
     *   "htmlContent": "<html>...</html>"
     * }
     */
    private String buildBrevoJsonPayload(String recipientEmail, String subject, String htmlContent) {
        // Escape special characters in JSON strings
        String escapedSubject = escapeJson(subject);
        String escapedHtmlContent = escapeJson(htmlContent);
        String escapedSenderName = escapeJson(senderName);

        return String.format(
            "{\"sender\":{\"name\":\"%s\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"htmlContent\":\"%s\"}",
            escapedSenderName,
            senderEmail,
            recipientEmail,
            escapedSubject,
            escapedHtmlContent
        );
    }

    /**
     * Escape special characters for JSON.
     */
    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    /**
     * Build professional HTML email template for OTP.
     */
    private String buildOtpEmailHtml(String otpCode) {
        return "<!DOCTYPE html>" +
            "<html lang=\"en\">" +
            "<head>" +
            "    <meta charset=\"UTF-8\">" +
            "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "    <title>Your OTP Code</title>" +
            "</head>" +
            "<body style=\"margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f9fc;\">" +
            "    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f7f9fc; padding: 40px 0;\">" +
            "        <tr>" +
            "            <td align=\"center\">" +
            "                <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);\">" +
            "                    <!-- Header -->" +
            "                    <tr>" +
            "                        <td style=\"padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;\">" +
            "                            <h1 style=\"margin: 0; font-size: 28px; font-weight: bold; color: #1a202c;\">SplitWith</h1>" +
            "                            <p style=\"margin: 8px 0 0; font-size: 14px; color: #718096;\">Split trip expenses with friends</p>" +
            "                        </td>" +
            "                    </tr>" +
            "                    <!-- Content -->" +
            "                    <tr>" +
            "                        <td style=\"padding: 40px;\">" +
            "                            <h2 style=\"margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a202c;\">Your OTP Code</h2>" +
            "                            <p style=\"margin: 0 0 24px; font-size: 14px; color: #4a5568; line-height: 1.6;\">" +
            "                                Use the following one-time password (OTP) to complete your authentication:" +
            "                            </p>" +
            "                            <!-- OTP Code Box -->" +
            "                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">" +
            "                                <tr>" +
            "                                    <td align=\"center\" style=\"padding: 20px; background-color: #edf2f7; border-radius: 8px;\">" +
            "                                        <span style=\"font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d3748; font-family: monospace;\">" +
            otpCode +
            "                                        </span>" +
            "                                    </td>" +
            "                                </tr>" +
            "                            </table>" +
            "                            <p style=\"margin: 24px 0 0; font-size: 13px; color: #718096; line-height: 1.6;\">" +
            "                                ⏰ <strong>This code expires in 10 minutes.</strong>" +
            "                            </p>" +
            "                            <p style=\"margin: 16px 0 0; font-size: 13px; color: #718096; line-height: 1.6;\">" +
            "                                If you didn't request this code, please ignore this email." +
            "                            </p>" +
            "                        </td>" +
            "                    </tr>" +
            "                    <!-- Footer -->" +
            "                    <tr>" +
            "                        <td style=\"padding: 20px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;\">" +
            "                            <p style=\"margin: 0; font-size: 12px; color: #a0aec0; text-align: center;\">" +
            "                                © 2026 SplitWith. All rights reserved." +
            "                            </p>" +
            "                        </td>" +
            "                    </tr>" +
            "                </table>" +
            "            </td>" +
            "        </tr>" +
            "    </table>" +
            "</body>" +
            "</html>";
    }
}
