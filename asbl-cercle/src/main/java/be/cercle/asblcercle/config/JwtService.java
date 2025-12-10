package be.cercle.asblcercle.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_KEY_BYTES = 32;
    private static final String FALLBACK_SECRET = "3d5f7c1a2b4e6d8f9a0c1b2d3e4f60718293a4b5c6d7e8f9a0b1c2d3e4f50617";

    private final String secret;
    private final long expirationMillis;
    private final Key key;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expiration}") long expirationMillis) {
        this.expirationMillis = expirationMillis;

        String resolvedSecret = secret == null ? "" : secret;
        byte[] keyBytes = resolvedSecret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < MIN_KEY_BYTES) {
            log.warn("JWT secret is too short ({} bytes). Using fallback key. Set JWT_SECRET to a 32+ byte value.", keyBytes.length);
            resolvedSecret = FALLBACK_SECRET;
            keyBytes = resolvedSecret.getBytes(StandardCharsets.UTF_8);
        }

        this.secret = resolvedSecret;
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
