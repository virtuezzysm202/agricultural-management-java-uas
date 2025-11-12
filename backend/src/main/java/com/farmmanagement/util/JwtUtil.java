package com.farmmanagement.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;

public class JwtUtil {
    private static final String SECRET_KEY = "your_secret_key_here";
    private static final long EXPIRATION_TIME = 86400000; // 1 hari (ms)

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
            JWT.require(Algorithm.HMAC256(SECRET_KEY)).build().verify(token);
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
