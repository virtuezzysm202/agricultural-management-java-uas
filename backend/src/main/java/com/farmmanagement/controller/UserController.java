package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.User;
import com.farmmanagement.service.UserService;
import com.farmmanagement.util.JwtUtil;
import com.google.gson.Gson;

import spark.Request;
import spark.Response;
import static spark.Spark.delete; // IMPORT DELETE
import static spark.Spark.get;
import static spark.Spark.halt;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put; // IMPORT PUT

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
                boolean success = userService.register(u.getUsername(), u.getPassword(), u.getRole(), u.getNama()); 
                res.type("application/json");
                res.status(success ? 201 : 400); 
                return success ? gson.toJson(Map.of("message", "User created")) 
                               : gson.toJson(Map.of("error", "Registration failed: Username may already exist"));
            });

            // LOGIN
            post("/login", (req, res) -> {
                User u = gson.fromJson(req.body(), User.class);
                User logged = userService.login(u.getUsername(), u.getPassword());
                res.type("application/json");

                if (logged != null) {
                    String token = JwtUtil.generateToken(logged.getUsername(), logged.getRole());
                    logged.setPassword(null);

                    return gson.toJson(Map.of(
                        "message", "Login successful",
                        "token", token,
                        "user", logged 
                    ));
                } else {
                    res.status(401);
                    return gson.toJson(Map.of("error", "Invalid credentials"));
                }
            });
            
            // ===============================================
            // FUNGSI BARU UNTUK PENGELOLAAN USER OLEH ADMIN
            // ===============================================
            
            // GET /api/user/manajer (untuk list manajer di Frontend)
            get("/manajer", (req, res) -> {
                res.type("application/json");
                try {
                    // Hanya ambil data yang diperlukan (tanpa password)
                    List<User> list = userService.getUsersByRole("manajer"); 
                    return gson.toJson(list); 
                } catch (Exception e) {
                    res.status(500);
                    System.err.println("Error GET /api/user/manajer: " + e.getMessage());
                    return gson.toJson(Map.of("error", "Gagal mengambil data manajer."));
                }
            });
            
            // PUT /api/user/:id (Update User/Pengawas)
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    User updatedData = gson.fromJson(req.body(), User.class);
                    
                    // Set ID dari URL, bukan dari body
                    updatedData.setId_user(id); 
                    
                    if (userService.updateUser(updatedData)) {
                        res.status(200);
                        return gson.toJson(Map.of("message", "User berhasil diperbarui"));
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "User tidak ditemukan atau gagal diperbarui."));
                    }
                } catch (NumberFormatException e) {
                    res.status(400); return gson.toJson(Map.of("error", "ID user harus berupa angka."));
                } catch (Exception e) {
                    res.status(500); 
                    System.err.println("Error PUT /api/user/:id: " + e.getMessage());
                    return gson.toJson(Map.of("error", "Internal Server Error saat update user."));
                }
            });

            // DELETE /api/user/:id (Hapus User/Pengawas)
            delete("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    if (userService.deleteUser(id)) {
                        res.status(200);
                        return gson.toJson(Map.of("message", "User berhasil dihapus"));
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "User tidak ditemukan."));
                    }
                } catch (NumberFormatException e) {
                    res.status(400); return gson.toJson(Map.of("error", "ID user harus berupa angka."));
                } catch (Exception e) {
                    res.status(500); 
                    System.err.println("Error DELETE /api/user/:id: " + e.getMessage());
                    return gson.toJson(Map.of("error", "Internal Server Error saat hapus user."));
                }
            });
        });
    }
    private String handleGetCurrentUser(Request req, Response res) {
        // ... (kode tetap sama)
        res.type("application/json");
        String authHeader = req.headers("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            halt(401, "Token required");
        }
        String token = authHeader.substring(7);

        try {
            String username = JwtUtil.getUsername(token);
            // Panggil DB untuk data lengkap, termasuk nama
            User userFromDb = userService.findByUsername(username); // ASUMSI: JwtUtil bisa mengambil ID user
            
            if (userFromDb != null) {
                 userFromDb.setPassword(null); // Jangan kirim password
                 return gson.toJson(userFromDb);
            }
            
            // Fallback jika ID tidak ada di token
            return gson.toJson(Map.of(
                "username", username, 
                "role", JwtUtil.getRole(token), 
                "nama", "" 
            ));

        } catch (Exception e) {
            System.err.println("Error processing token for current user: " + e.getMessage());
            res.status(500);
            return gson.toJson(Map.of("error", "Failed to retrieve user data"));
        }
    }
}