package com.farmmanagement.controller;

import java.util.HashMap;
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

        post("/login", (req, res) -> {
    res.type("application/json");
    try {
        User u = gson.fromJson(req.body(), User.class);
        User userFromDb = userService.findByUsername(u.getUsername());

        if (userFromDb == null) {
            res.status(404);
            Map<String,String> response = new HashMap<>();
            response.put("error", "Username tidak ada");
            return gson.toJson(response);
        }

        boolean passwordMatch = userService.checkPassword(u.getPassword(), userFromDb.getPassword());
        if (!passwordMatch) {
            res.status(401);
            Map<String,String> response = new HashMap<>();
            response.put("error", "Salah password");
            return gson.toJson(response);
        }

        String token = JwtUtil.generateToken(userFromDb.getUsername(), userFromDb.getRole());
        userFromDb.setPassword(null);

        Map<String,Object> response = new HashMap<>();
        response.put("message", "Login berhasil");
        response.put("token", token);
        response.put("user", userFromDb);

        return gson.toJson(response);

    } catch (Exception e) {
        res.status(500);
        System.err.println("Error POST /api/user/login: " + e.getMessage());
        Map<String,String> response = new HashMap<>();
        response.put("error", "Internal server error saat login");
        return gson.toJson(response);
    }
});
            // RESET PASSWORD (hanya untuk pembeli)
            post("/reset-password", (req, res) -> {
                res.type("application/json");
                try {
                    // Ambil data dari request body
                    Map<String, String> body = gson.fromJson(req.body(), Map.class);
                    String username = body.get("username");
                    String oldPassword = body.get("oldPassword");
                    String newPassword = body.get("newPassword");

                    if (username == null || oldPassword == null || newPassword == null) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Username, password lama, dan password baru harus diisi."));
                    }

                    // Ambil user dari DB
                    User user = userService.findByUsername(username);
                    if (user == null) {
                        res.status(404);
                        return gson.toJson(Map.of("error", "User tidak ditemukan."));
                    }

                    // Cek role: hanya pembeli yang boleh reset password sendiri
                    if (!"pembeli".equalsIgnoreCase(user.getRole())) {
                        res.status(403);
                        return gson.toJson(Map.of("error", "Hanya pembeli yang dapat melakukan reset password."));
                    }

                    boolean success = userService.resetPassword(username, oldPassword, newPassword);
                    if (success) {
                        res.status(200);
                        return gson.toJson(Map.of("message", "Password berhasil diubah."));
                    } else {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Password lama tidak cocok."));
                    }
                } catch (Exception e) {
                    res.status(500);
                    System.err.println("Error POST /api/user/reset-password: " + e.getMessage());
                    return gson.toJson(Map.of("error", "Internal Server Error saat reset password."));
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