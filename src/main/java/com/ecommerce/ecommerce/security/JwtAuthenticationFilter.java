package com.ecommerce.ecommerce.security;

import com.ecommerce.ecommerce.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    // ✅ UPDATED: Better public endpoint patterns
    private final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/verify-otp",
            "/api/auth/resend-otp",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/check-verification",
            "/api/auth/verify-reset-otp",
            "/api/public/"
    );

    // ✅ ADDED: Public path prefixes for broader matching
    private final List<String> PUBLIC_PATH_PREFIXES = Arrays.asList(
            "/api/products",
            "/api/categories",
            "/products",
            "/categories",
            "/public"
    );

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // ✅ IMPROVED: Skip JWT processing for public endpoints
        if (isPublicEndpoint(requestURI, method)) {
            filterChain.doFilter(request, response);
            return; // Critical: exit the filter for public routes
        }

        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtUtil.extractUsername(jwt);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    // ✅ IMPROVED: Better logic for checking public endpoints
    private boolean isPublicEndpoint(String requestURI, String method) {
        // Allow all GET requests to products and categories (read-only access)
        if (("GET".equalsIgnoreCase(method) &&
                (requestURI.startsWith("/api/products") ||
                        requestURI.startsWith("/api/categories") ||
                        requestURI.startsWith("/products/") ||
                        requestURI.startsWith("/categories/")))) {
            return true;
        }

        // Check exact matches for auth endpoints
        if (PUBLIC_ENDPOINTS.stream().anyMatch(requestURI::startsWith)) {
            return true;
        }

        // Check path prefixes for broader matching
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(requestURI::startsWith);
    }
}