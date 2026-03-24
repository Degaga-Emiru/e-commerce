package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.UserRole;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    public EmailService(JavaMailSender mailSender, UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    public void sendOtpVerificationEmail(String to, String otpCode, String userName) {
        String subject = "Verify Your Email - OTP Code";
        String htmlContent = createOtpVerificationEmail(userName, otpCode);
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

    public void sendOutForDelivery(String to, String userName, String orderNumber) {
        String subject = "Your Order is Out for Delivery 🚚 #" + orderNumber;
        String htmlContent = createOutForDeliveryEmail(userName, orderNumber);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendOrderDelivered(String to, String userName, String orderNumber) {
        String subject = "Order Delivered ✅ #" + orderNumber;
        String htmlContent = createOrderDeliveredEmail(userName, orderNumber);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendEscrowReleased(String to, String userName, String orderNumber, Double amount, Double fee) {
        String subject = "Payment Released 💰 - Order #" + orderNumber;
        String htmlContent = createEscrowReleasedEmail(userName, orderNumber, amount, fee);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendPromotionalEmail(String to, String userName, String promotionTitle,
                                     String promotionDescription, String couponCode) {
        String subject = "Special Offer: " + promotionTitle;
        String htmlContent = createPromotionalEmail(userName, promotionTitle, promotionDescription, couponCode);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendSystemNotification(String to, String userName, String subject, String message, String color) {
        if (color == null || color.isEmpty()) color = "#FFA500";
        String htmlContent = createSystemNotificationEmail(color, subject, userName, message);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendLowStockAlert(String to, String userName, String productName, int stockQuantity) {
        String subject = "Low Stock Alert: " + productName;
        String htmlContent = createLowStockAlertEmail(userName, productName, stockQuantity);
        sendHtmlMessage(to, subject, htmlContent);
    }

    public void sendSystemNotificationToAllUsers(String subject, String message, String color) {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            if (user.isEnabled()) {
                try {
                    sendSystemNotification(user.getEmail(), user.getFirstName(), subject, message, color);
                } catch (Exception e) {
                    System.err.println("Failed to send notification to: " + user.getEmail());
                }
            }
        }
    }

    public void sendAdminNotification(String subject, String message, String color) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        for (User admin : admins) {
            try {
                sendSystemNotification(admin.getEmail(), admin.getFirstName(), subject, message, color);
            } catch (Exception e) {
                System.err.println("Admin notify failed: " + e.getMessage());
            }
        }
    }

    public void sendNewProductNotification(com.ecommerce.ecommerce.entity.Product product) {
        // Notify admins about new product listing
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        for (User admin : admins) {
            try {
                sendSimpleEmail(admin.getEmail(), "New Product Listed: " + product.getName(),
                    "A new product '" + product.getName() + "' has been listed. Price: ETB " + product.getPrice());
            } catch (Exception e) {
                System.err.println("New product notify failed: " + e.getMessage());
            }
        }
    }

    private void sendHtmlMessage(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send HTML email to: " + to);
            sendSimpleEmail(to, subject, extractTextFromHtml(htmlContent));
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
    private String createOtpVerificationEmail(String userName, String otpCode) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}.container{max-width:600px;margin:0 auto;padding:20px;}.header{background:#4CAF50;color:white;padding:20px;text-align:center;}.content{padding:20px;background:#f9f9f9;text-align:center;}.otp-code{font-size:42px;font-weight:bold;color:#4CAF50;margin:20px 0;padding:20px;background:white;border:2px dashed #4CAF50;display:inline-block;}.footer{text-align:center;margin-top:20px;font-size:12px;color:#666;}</style></head>
        <body><div class="container"><div class="header"><h2>Verify Your Email</h2></div><div class="content"><p>Hello <strong>%s</strong></p><p>Use this OTP code to verify your email:</p><div class="otp-code">%s</div><p>Expires in 15 minutes.</p></div></div></body></html>
        """.formatted(userName, otpCode);
    }

    private String createWelcomeEmail(String userName) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}.container{max-width:600px;margin:0 auto;padding:20px;}.header{background:#2196F3;color:white;padding:20px;text-align:center;}.content{padding:20px;background:#f9f9f9;}.footer{text-align:center;margin-top:20px;font-size:12px;color:#666;}</style></head>
        <body><div class="container"><div class="header"><h2>Welcome!</h2></div><div class="content"><p>Hello <strong>%s</strong>,</p><p>Welcome to our family! Your account is verified.</p></div></div></body></html>
        """.formatted(userName);
    }

    private String createOrderConfirmationEmail(String userName, String orderNumber, Double totalAmount, String trackingNumber) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}.container{max-width:600px;margin:0 auto;padding:20px;}.header{background:#007bff;color:white;padding:20px;text-align:center;}.content{padding:20px;background:#f9f9f9;}</style></head>
        <body><div class="container"><div class="header"><h2>Order Confirmation ✅</h2></div><div class="content"><p>Hello <strong>%s</strong>,</p><p>Your order <strong>#%s</strong> has been received!</p><p>Total: <strong>ETB %.2f</strong></p></div></div></body></html>
        """.formatted(userName, orderNumber, totalAmount);
    }

    private String createShippingUpdateEmail(String userName, String orderNumber, String status, String trackingNumber, String estimatedDelivery) {
        return """
        <html>
        <head><style>body{font-family:Arial,sans-serif;}.container{background:#fff;padding:20px;border-radius:8px;max-width:600px;margin:auto;}h2{color:#ff6600;}.details{padding:15px;background:#fafafa;border-left:4px solid #ff6600;}</style></head>
        <body><div class="container"><h2>Shipping Update</h2><p>Hi <b>%s</b>,</p><p>Update for order <b>#%s</b>:</p><div class="details"><p><b>Status:</b> %s</p><p><b>Estimated Delivery:</b> %s</p></div></div></body></html>
        """.formatted(userName, orderNumber, status, estimatedDelivery);
    }

    private String createOutForDeliveryEmail(String userName, String orderNumber) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}</style></head>
        <body><div style="max-width:600px;margin:0 auto;padding:20px;"><div style="background:#f39c12;color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;"><h2>🚚 Out for Delivery!</h2></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 10px 10px;border:1px solid #eee;"><p>Good news <strong>%s</strong>,</p><p>Your order <strong>#%s</strong> is out for delivery today!</p></div></div></body></html>
        """.formatted(userName, orderNumber);
    }

    private String createOrderDeliveredEmail(String userName, String orderNumber) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}</style></head>
        <body><div style="max-width:600px;margin:0 auto;padding:20px;"><div style="background:#2ecc71;color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;"><h2>✅ Order Delivered</h2></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 10px 10px;border:1px solid #eee;"><p>Hello <strong>%s</strong>,</p><p>Your order <strong>#%s</strong> has been delivered!</p></div></div></body></html>
        """.formatted(userName, orderNumber);
    }

    private String createEscrowReleasedEmail(String userName, String orderNumber, Double amount, Double fee) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}</style></head>
        <body><div style="max-width:600px;margin:0 auto;padding:20px;"><div style="background:#3498db;color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;"><h2>💰 Payment Released</h2></div><div style="padding:20px;background:#f9f9f9;border-radius:0 0 10px 10px;border:1px solid #eee;"><p>Hello <strong>%s</strong>,</p><p>Payment for order <strong>#%s</strong> released.</p><p>Amount: <strong>ETB %.2f</strong></p><p>Fee (10%%): <strong>ETB %.2f</strong></p></div></div></body></html>
        """.formatted(userName, orderNumber, amount, fee);
    }

    private String createPasswordResetEmail(String userName, String resetToken) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}.reset-token{font-size:24px;color:#dc3545;text-align:center;padding:15px;border:2px dashed #dc3545;}</style></head>
        <body><div style="max-width:600px;margin:0 auto;padding:20px;"><h2 style="background:#dc3545;color:white;padding:20px;text-align:center;">Password Reset</h2><p>Hello %s, use this token: <div class="reset-token">%s</div></p></div></body></html>
        """.formatted(userName, resetToken);
    }

    private String createPromotionalEmail(String userName, String promotionTitle, String promotionDescription, String couponCode) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}.promo{background:#9c27b0;color:white;padding:20px;text-align:center;}</style></head>
        <body><div class="container"><div class="promo"><h2>%s</h2></div><p>Hello %s, %s. Code: %s</p></div></body></html>
        """.formatted(promotionTitle, userName, promotionDescription, couponCode);
    }

    private String createSystemNotificationEmail(String color, String subject, String userName, String message) {
        return """
        <!DOCTYPE html>
        <html>
        <body><div style="background:%s;padding:20px;color:white;border-radius:10px;"><h2>%s</h2><p>Hi %s, %s</p></div></body></html>
        """.formatted(color, subject, userName, message);
    }

    private String createLowStockAlertEmail(String userName, String productName, int stockQuantity) {
        return """
        <!DOCTYPE html>
        <html>
        <body><div style="background:#ffc107;padding:20px;text-align:center;"><h2>Low Stock Alert</h2><p>Hello %s, %s has only %d units left!</p></div></body></html>
        """.formatted(userName, productName, stockQuantity);
    }

    private String extractTextFromHtml(String html) {
        return html.replaceAll("<[^>]*>", "").replaceAll("&nbsp;", " ").replaceAll("\\s+", " ").trim();
    }
}
