package com.farmmanagement.middleware;

import com.farmmanagement.util.JwtUtil;
import static spark.Spark.*;

public class AuthMiddleware {

    public static void register() {

        // CORS Middleware
        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        });

        // OPTIONS (untuk preflight request React)
        options("/*", (req, res) -> "OK");

        // Middleware JWT + Role-based Auth
        before("/api/*", (req, res) -> {
            String path = req.pathInfo();

            // Lewati login & register
            if (path.equals("/api/user/login") || path.equals("/api/user/register")) {
                return;
            }

            String authHeader = req.headers("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                halt(401, "Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            if (!JwtUtil.verifyToken(token)) {
                halt(401, "Invalid or expired token");
            }

            // Role-based access control
            String role = JwtUtil.getRole(token);

            if (path.startsWith("/api/admin") && !"admin".equals(role)) {
                halt(403, "Access denied: Admin only");
            }
            if (path.startsWith("/api/manager") && !"manajer".equals(role)) {
                halt(403, "Access denied: Manager only");
            }
            if (path.startsWith("/api/pembeli") && !"pembeli".equals(role)) {
                halt(403, "Access denied: Buyer only");
            }
        });
    }
}
