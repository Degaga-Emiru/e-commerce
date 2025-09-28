package com.ecommerce.ecommerce.security;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ecommerce.ecommerce.dto.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthenticationEntryPoint() {
        this.objectMapper = new ObjectMapper();
        // ✅ Register Java 8 time module to handle LocalDateTime
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // ✅ Create response without timestamp or use String for timestamp
        ApiResponse apiResponse = new ApiResponse(false, "Unauthorized access: " + authException.getMessage());

        // ✅ Alternative: If you must keep timestamp, ensure it's String type
        // apiResponse.setTimestamp(LocalDateTime.now().toString());

        try {
            String jsonResponse = objectMapper.writeValueAsString(apiResponse);
            response.getWriter().write(jsonResponse);
        } catch (Exception e) {
            // ✅ Fallback response if serialization fails
            response.getWriter().write("{\"success\":false,\"message\":\"Authentication failed\"}");
        }
    }
}