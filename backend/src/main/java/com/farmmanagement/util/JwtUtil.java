package com.farmmanagement.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;

public class JwtUtil {

    // Ambil secret dari environment variable (fallback tetap ada untuk mencegah error)
    private static final String SECRET_KEY = System.getenv("JWT_SECRET") != null
            ? System.getenv("JWT_SECRET")
            : "default_super_long_secure_secret_key_2025";

    private static final long EXPIRATION_TIME = 3600000; // 1 jam


    public static String generateToken(String username, String role) {
        return JWT.create()
                .withSubject(username)
                .withClaim("role", role)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public static boolean verifyToken(String token) {
        try {
            JWT.require(Algorithm.HMAC256(SECRET_KEY))
               .build()
               .verify(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static String getUsername(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                  .build()
                  .verify(token)
                  .getSubject();
    }

    public static String getRole(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                  .build()
                  .verify(token)
                  .getClaim("role")
                  .asString();
    }
}
