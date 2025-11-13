package com.farmmanagement.controller;

import java.util.Map;

import com.farmmanagement.model.User;
import com.farmmanagement.service.UserService;
import com.farmmanagement.util.JwtUtil;
import com.google.gson.Gson;

import spark.Request;
import spark.Response;
import static spark.Spark.get;
import static spark.Spark.halt;
import static spark.Spark.path;
import static spark.Spark.post;

public class UserController {

    private final UserService userService = new UserService();
    private final Gson gson = new Gson();

    public UserController() {
        path("/api/user", () -> {
            
            // GET CURRENT USER
            get("/current", this::handleGetCurrentUser);

            // REGISTER
            post("/register", (req, res) -> {
                User u = gson.fromJson(req.body(), User.class);
                // Asumsi register juga menerima nama
                boolean success = userService.register(u.getUsername(), u.getPassword(), u.getRole(), u.getNama()); 
                res.type("application/json");
                res.status(success ? 201 : 400); // Gunakan 201 Created untuk sukses
                return success ? gson.toJson(Map.of("message", "User created")) 
                               : gson.toJson(Map.of("error", "Registration failed: Username may already exist"));
            });

            // LOGIN
            post("/login", (req, res) -> {
                User u = gson.fromJson(req.body(), User.class);
                User logged = userService.login(u.getUsername(), u.getPassword());
                res.type("application/json");

                if (logged != null) {
                    // Tambahkan nama ke token jika perlu, atau pastikan JwtUtil dapat mengambil nama dari database
                    // Contoh: Jika JwtUtil hanya menyimpan username dan role, Anda harus update util tersebut
                    String token = JwtUtil.generateToken(logged.getUsername(), logged.getRole());
                    
                    // Jangan kirim password kembali
                    logged.setPassword(null);

                    return gson.toJson(Map.of(
                        "message", "Login successful",
                        "token", token,
                        // Kirim objek user lengkap (tanpa password)
                        "user", logged 
                    ));
                } else {
                    res.status(401);
                    return gson.toJson(Map.of("error", "Invalid credentials"));
                }
            });
        });
    }

    /**
     * Menangani GET /api/user/current.
     * Mengambil data user (username, role) dari Token JWT yang ada di header.
     * Ini hanya bisa diakses setelah AuthMiddleware memverifikasi token.
     */
    private String handleGetCurrentUser(Request req, Response res) {
        res.type("application/json");
        
        // Ambil token yang sudah pasti ada (karena AuthMiddleware sudah memverifikasinya)
        String authHeader = req.headers("Authorization");
        
        // Cek darurat (seharusnya tidak pernah terjadi jika AuthMiddleware bekerja)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            halt(401, "Token required");
        }
        String token = authHeader.substring(7);

        try {
            // Ambil payload dari token
            String username = JwtUtil.getUsername(token);
            String role = JwtUtil.getRole(token);
            // Asumsi JwtUtil memiliki getNama() jika nama disimpan di payload
            // Jika nama tidak disimpan di token, Anda perlu memanggil userService.findByUsername(username)
            // Di sini kita asumsikan untuk efisiensi, hanya data di token yang diambil.
            // Jika nama tidak di token:
            // User userFromDb = userService.findByUsername(username); 
            // return gson.toJson(userFromDb);

            // Contoh response cepat (jika nama tidak di token, set null atau kosong)
            return gson.toJson(Map.of(
                "username", username, 
                "role", role, 
                "nama", "" // Isi dengan nama jika Anda bisa mengekstraknya dari token/DB
            ));

        } catch (Exception e) {
            System.err.println("Error processing token for current user: " + e.getMessage());
            res.status(500);
            return gson.toJson(Map.of("error", "Failed to retrieve user data"));
        }
    }
}