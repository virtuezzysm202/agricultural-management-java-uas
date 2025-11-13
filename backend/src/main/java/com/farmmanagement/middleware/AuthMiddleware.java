package com.farmmanagement.middleware;

import com.farmmanagement.util.JwtUtil;

import static spark.Spark.before;
import static spark.Spark.halt;

public class AuthMiddleware {

    public static void register() {

        //  Middleware JWT + Role-based Auth
        before("/api/*", (req, res) -> {
            String path = req.pathInfo();

            // Lewati endpoint public (login & register)
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

            // Ambil role dari token
            String role = JwtUtil.getRole(token);

            // Role-based access control
            if (path.startsWith("/api/admin") && !"admin".equalsIgnoreCase(role)) {
                halt(403, "Access denied: Admin only");
            }

            if (path.startsWith("/api/manager") && !"manajer".equalsIgnoreCase(role)) {
                halt(403, "Access denied: Manager only");
            }

            if (path.startsWith("/api/pembeli") && !"pembeli".equalsIgnoreCase(role)) {
                halt(403, "Access denied: Buyer only");
            }

            //  Tambahkan agar admin tetap bisa akses semua endpoint
            if ("admin".equalsIgnoreCase(role)) {
                return; // admin superuser: bypass semua filter
            }
        });
    }
}
