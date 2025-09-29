package com.ecommerce.ecommerce.service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpVerificationEmail(String to, String otpCode, String userName) {
        String subject = "Verify Your Email - OTP Code";
        String htmlContent = createOtpVerificationEmail(otpCode, userName);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to Our E-Commerce Platform!";
        String htmlContent = createWelcomeEmail(userName);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendOrderConfirmation(String to, String userName, String orderNumber,
                                      Double totalAmount, String trackingNumber) {
        String subject = "Order Confirmation - #" + orderNumber;
        String htmlContent = createOrderConfirmationEmail(userName, orderNumber, totalAmount, trackingNumber);
        sendHtmlMessage(to, subject, htmlContent);
    }
    // Add an overloaded method without tracking number
    public void sendOrderConfirmation(String to, String userName, String orderNumber,
                                      Double totalAmount) {
        sendOrderConfirmation(to, userName, orderNumber, totalAmount, null);
    }

    public void sendPasswordResetEmail(String to, String userName, String resetToken) {
        String subject = "Password Reset Request";
        String htmlContent = createPasswordResetEmail(userName, resetToken);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendShippingUpdate(String to, String userName, String orderNumber,
                                   String status, String trackingNumber, String estimatedDelivery) {
        String subject = "Shipping Update for Order #" + orderNumber;
        String htmlContent = createShippingUpdateEmail(userName, orderNumber, status, trackingNumber, estimatedDelivery);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendPromotionalEmail(String to, String userName, String promotionTitle,
                                     String promotionDescription, String couponCode) {
        String subject = "Special Offer: " + promotionTitle;
        String htmlContent = createPromotionalEmail(userName, promotionTitle, promotionDescription, couponCode);
        sendHtmlMessage(to, subject, htmlContent);
    }

    private void sendHtmlMessage(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send HTML email to: " + to);
            System.err.println("Error: " + e.getMessage());
            // Don't throw exception - allow registration to continue
            // Fallback to simple text email
            try {
                sendSimpleEmail(to, subject, extractTextFromHtml(htmlContent));
            } catch (Exception ex) {
                System.err.println("❌ Fallback email also failed: " + ex.getMessage());
                // Still don't throw - registration should succeed even if email fails
            }
        }
    }
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + to + ", Error: " + e.getMessage());
        }
    }

    // HTML Email Content Generators
    private String createOtpVerificationEmail(String otpCode, String userName) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; text-align: center; }
                .otp-code { font-size: 42px; font-weight: bold; color: #4CAF50; margin: 20px 0; padding: 20px; background: white; border: 2px dashed #4CAF50; display: inline-block; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Verify Your Email Address</h2>
                </div>
                <div class="content">
                    <p><strong>Hello %s</strong></p>
                    <p>Use this OTP code to verify your email:</p>
                    <div class="otp-code">%s</div>
                    
                    <p>Thank you for registering with our e-commerce platform. Please use the above OTP code to verify your email address.</p>
                    <p>This OTP code will expire in 15 minutes.</p>
                    <p>If you didn't create an account with us, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 E-Commerce Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(userName, otpCode);
    }


    private String createWelcomeEmail(String userName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .benefits { margin: 20px 0; }
                    .benefit-item { margin: 10px 0; padding-left: 20px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Welcome to Our E-Commerce Platform!</h2>
                    </div>
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        <p>Welcome to our e-commerce family! Your account has been successfully verified.</p>
                        <div class="benefits">
                            <h3>As a new member, you enjoy:</h3>
                            <div class="benefit-item">✓ 10%% discount on your first purchase</div>
                            <div class="benefit-item">✓ Exclusive access to new user deals</div>
                            <div class="benefit-item">✓ Priority customer support</div>
                            <div class="benefit-item">✓ Fast and secure checkout</div>
                        </div>
                        <p>Start shopping now and discover amazing products at great prices!</p>
                        <p>Happy shopping! 🛍️</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 E-Commerce Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName);
    }

    private String createOrderConfirmationEmail(String userName, String orderNumber, Double totalAmount, String trackingNumber) {
        String trackingSection = "";
        if (trackingNumber != null && !trackingNumber.isEmpty()) {
            trackingSection = """
                <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>📦 Tracking Information</h3>
                    <p>Tracking Number: <strong>%s</strong></p>
                    <p>Estimated delivery: 3-5 business days</p>
                </div>
                """.formatted(trackingNumber);
        }

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .detail-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Order Confirmation ✅</h2>
                    </div>
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        <p>Your order has been successfully received and is being processed.</p>
                        <div class="order-details">
                            <div class="detail-row">
                                <span><strong>Order Number:</strong></span>
                                <span>%s</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Total Amount:</strong></span>
                                <span><strong>$%.2f</strong></span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Status:</strong></span>
                                <span style="color: green; font-weight: bold;">Confirmed</span>
                            </div>
                        </div>
                        %s
                        <p>We'll notify you when your order ships.</p>
                        <p>Thank you for shopping with us!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 E-Commerce Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, orderNumber, totalAmount, trackingSection);
    }

    private String createPasswordResetEmail(String userName, String resetToken) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .reset-token { font-size: 24px; font-weight: bold; text-align: center; color: #dc3545; margin: 20px 0; padding: 15px; background: white; border: 2px dashed #dc3545; }
                    .warning { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Password Reset Request</h2>
                    </div>
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        <p>We received a request to reset your password. Use the following reset token:</p>
                        <div class="reset-token">%s</div>
                        <div class="warning">
                            <strong>Important:</strong> This token expires in 24 hours. Do not share it with anyone.
                        </div>
                        <p>If you didn't request this reset, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 E-Commerce Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, resetToken);
    }

    private String createShippingUpdateEmail(String userName, String orderNumber, String status, String trackingNumber, String estimatedDelivery) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .shipping-info { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Shipping Update 📦</h2>
                    </div>
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        <p>Your order <strong>#%s</strong> has been updated:</p>
                        <div class="shipping-info">
                            <p><strong>Status:</strong> %s</p>
                            <p><strong>Tracking Number:</strong> %s</p>
                            <p><strong>Estimated Delivery:</strong> %s</p>
                        </div>
                        <p>You can track your package using the tracking number above.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 E-Commerce Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, orderNumber, status, trackingNumber, estimatedDelivery);
    }

    private String createPromotionalEmail(String userName, String promotionTitle, String promotionDescription, String couponCode) {
        String couponSection = "";
        if (couponCode != null && !couponCode.isEmpty()) {
            couponSection = """
                <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
                    <h3>Your Special Coupon Code:</h3>
                    <div style="font-size: 24px; font-weight: bold; color: #155724;">%s</div>
                    <p>Use this code at checkout to claim your discount!</p>
                </div>
                """.formatted(couponCode);
        }

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #9c27b0; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .promo-section { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; text-align: center; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🎉 Special Offer: %s</h2>
                    </div>
                    <div class="content">
                        <p>Hello <strong>%s</strong>,</p>
                        <div class="promo-section">
                            <h3>%s</h3>
                            <p>%s</p>
                        </div>
                        %s
                        <p>Don't miss out on this limited-time offer!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 E-Commerce Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(promotionTitle, userName, promotionTitle, promotionDescription, couponSection);
    }

    // Utility method to extract plain text from HTML for fallback
    private String extractTextFromHtml(String html) {
        // Simple HTML tag removal
        return html.replaceAll("<[^>]*>", "")
                .replaceAll("&nbsp;", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // Additional utility methods for different email types
    public void sendNewUserDiscountEmail(String to, String userName, String couponCode, int discountPercent) {
        String subject = "Welcome Discount for New Users!";
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}</style></head>
            <body>
                <div style="max-width:600px;margin:0 auto;padding:20px;">
                    <div style="background:#28a745;color:white;padding:20px;text-align:center;">
                        <h2>Welcome to Our Store! 🎉</h2>
                    </div>
                    <div style="padding:20px;background:#f9f9f9;">
                        <p>Hello <strong>%s</strong>,</p>
                        <p>As a welcome gift, here's a <strong>%d%% discount</strong> on your first purchase!</p>
                        <div style="background:#d4edda;padding:15px;text-align:center;margin:15px 0;">
                            <h3>Your Coupon Code:</h3>
                            <div style="font-size:28px;font-weight:bold;color:#155724;">%s</div>
                        </div>
                        <p>Use this code at checkout to claim your discount.</p>
                        <p>Happy shopping!</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, discountPercent, couponCode);

        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendOrderShippedEmail(String to, String userName, String orderNumber, String trackingUrl) {
        String subject = "Your Order Has Shipped! - #" + orderNumber;
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}</style></head>
            <body>
                <div style="max-width:600px;margin:0 auto;padding:20px;">
                    <div style="background:#17a2b8;color:white;padding:20px;text-align:center;">
                        <h2>🚚 Your Order is on the Way!</h2>
                    </div>
                    <div style="padding:20px;background:#f9f9f9;">
                        <p>Hello <strong>%s</strong>,</p>
                        <p>Great news! Your order <strong>#%s</strong> has been shipped.</p>
                        <div style="background:#d1ecf1;padding:15px;margin:15px 0;">
                            <p><strong>Track your package:</strong> <a href="%s">Click here to track</a></p>
                        </div>
                        <p>Expected delivery: 3-5 business days</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, orderNumber, trackingUrl);

        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendAdminNotification(String adminEmail, String subject, String message) {
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}</style></head>
            <body>
                <div style="max-width:600px;margin:0 auto;padding:20px;">
                    <div style="background:#dc3545;color:white;padding:20px;text-align:center;">
                        <h2>🔔 Admin Notification</h2>
                    </div>
                    <div style="padding:20px;background:#f9f9f9;">
                        <h3>%s</h3>
                        <p>%s</p>
                        <p><em>This is an automated admin notification.</em></p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(subject, message);

        sendHtmlMessage(adminEmail, "Admin Alert: " + subject, htmlContent);
    }
}
