package com.casino.coinflip.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    
    @Value("${app.jwt.secret}")
    private String secretKey;
    
    @Value("${app.jwt.expiration}")
    private long jwtExpiration;
    
    // Create a more secure key with sufficient length for HS256
    private SecretKey getSignInKey() {
        try {
            // Try to decode as Base64 first
            byte[] keyBytes = Base64.getDecoder().decode(secretKey);
            logger.debug("Using Base64 decoded key, length: {} bytes", keyBytes.length);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            // Not valid Base64, use as regular string
            logger.warn("Secret key is not valid Base64, using as UTF-8 string");
            byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
            logger.debug("Secret key length: {} bytes", keyBytes.length);
            
            // Ensure the key is at least 32 bytes (256 bits) for HS256
            if (keyBytes.length < 32) {
                logger.warn("Secret key is less than 32 bytes (256 bits), which is the minimum for HS256. Padding key...");
                byte[] paddedKey = new byte[32];
                System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
                keyBytes = paddedKey;
            }
            
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }

    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (Exception e) {
            logger.error("Failed to extract username from token: {}", e.getMessage());
            throw e;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add authorities to token claims for better role handling
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        
        claims.put("authorities", authorities);
        logger.debug("Generating token for user: {} with authorities: {}", userDetails.getUsername(), authorities);
        
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        try {
            Date issuedAt = new Date(System.currentTimeMillis());
            Date expiration = new Date(System.currentTimeMillis() + jwtExpiration);
            
            logger.debug("Token expiration set to: {}", expiration);
            
            String token = Jwts.builder()
                    .setClaims(extraClaims)
                    .setSubject(userDetails.getUsername())
                    .setIssuedAt(issuedAt)
                    .setExpiration(expiration)
                    .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                    .compact();
            
            logger.debug("Token generated successfully");
            return token;
        } catch (Exception e) {
            logger.error("Failed to generate token: {}", e.getMessage(), e);
            throw e;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isUsernameValid = username.equals(userDetails.getUsername());
            boolean isTokenExpired = isTokenExpired(token);
            
            logger.debug("Token validation: username match={}, token expired={}", isUsernameValid, isTokenExpired);
            
            return isUsernameValid && !isTokenExpired;
        } catch (JwtException e) {
            logger.error("JWT token validation error: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Unexpected error during token validation: {}", e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts
                    .parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            logger.error("JWT parsing error: {}", e.getMessage());
            throw e;
        }
    }
}