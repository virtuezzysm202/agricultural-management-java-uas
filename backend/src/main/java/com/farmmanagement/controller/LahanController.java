package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.Lahan;
import com.farmmanagement.model.User;
import com.farmmanagement.service.LahanService;
import com.farmmanagement.service.UserService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class LahanController {

    private static final LahanService lahanService = new LahanService();
    private static final UserService userService = new UserService();
    // Menggunakan Gson standar karena tidak ada Date
    private static final Gson gson = new GsonBuilder().create();

    public static void registerRoutes() {
        path("/api/lahan", () -> {

            // GET semua lahan
            get("", (req, res) -> {
                res.type("application/json");
                try {
                    List<Lahan> list = lahanService.getAllLahan();
                    return gson.toJson(list);
                } catch (Exception e) {
                    System.err.println("Error GET /api/lahan: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data lahan dari database."));
                }
            });

            // GET by id
            get("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Lahan l = lahanService.getLahanById(id);
                    if (l != null) return gson.toJson(l);
                    res.status(404);
                    return gson.toJson(Map.of("error", "Lahan tidak ditemukan"));
                } catch (NumberFormatException e) {
                    res.status(400); 
                    return gson.toJson(Map.of("error", "ID lahan harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error GET /api/lahan/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });

            // POST tambah lahan
            post("", (req, res) -> {
                res.type("application/json");
                
                try {
                    if (req.body() == null || req.body().trim().isEmpty()) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Body request tidak boleh kosong."));
                    }
                    
                    Lahan l = gson.fromJson(req.body(), Lahan.class);
                    
                    if (l.getNama_lahan() == null || l.getNama_lahan().isEmpty() || l.getLuas() <= 0 || l.getId_pengawas() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data lahan tidak lengkap atau tidak valid (Nama, Luas, Pengawas harus diisi)."));
                    }

                    User pengawas = userService.getUserById(l.getId_pengawas());
                    if (pengawas == null) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID pengawas tidak ditemukan."));
                    }
                    
                    if (!"manajer".equalsIgnoreCase(pengawas.getRole())) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID pengawas harus memiliki role 'manajer'. Role saat ini: " + pengawas.getRole()));
                    }
                    
                    boolean ok = lahanService.addLahan(l);
                    
                    if (ok) {
                        res.status(201); // 201 Created
                        return gson.toJson(Map.of("message", "Lahan berhasil ditambahkan"));
                    }
                    
                    res.status(400); 
                    return gson.toJson(Map.of("error", "Gagal menambahkan lahan, cek data input."));
                    
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (POST /lahan): " + e.getMessage());
                    res.status(400); 
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah."));
                } catch (Exception e) {
                    System.err.println("!!! UNHANDLED EXCEPTION (POST /api/lahan) !!!");
                    e.printStackTrace(); 
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error: Gagal menyimpan data."));
                }
            });

            // PUT update lahan
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Lahan l = gson.fromJson(req.body(), Lahan.class);
                    l.setId_lahan(id); 
                    
                    if (l.getNama_lahan() == null || l.getNama_lahan().isEmpty() || l.getLuas() <= 0 || l.getId_pengawas() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data lahan tidak lengkap atau tidak valid."));
                    }
                    

                    User pengawas = userService.getUserById(l.getId_pengawas());
                    if (pengawas == null) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID pengawas tidak ditemukan."));
                    }
                    
                    if (!"manajer".equalsIgnoreCase(pengawas.getRole())) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID pengawas harus memiliki role 'manajer'. Role saat ini: " + pengawas.getRole()));
                    }
                    
                    boolean ok = lahanService.updateLahan(l);
                    
                    if (ok) {
                        return gson.toJson(Map.of("message", "Lahan berhasil diperbarui"));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal memperbarui lahan: ID tidak ditemukan atau data salah."));
                    
                } catch (NumberFormatException e) {
                    res.status(400); 
                    return gson.toJson(Map.of("error", "ID lahan harus berupa angka."));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT /lahan): " + e.getMessage());
                    res.status(400); 
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah."));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/lahan/:id:");
                    e.printStackTrace();
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update."));
                }
            });

            // DELETE hapus lahan
            delete("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    boolean ok = lahanService.deleteLahan(id);
                    
                    if (ok) {
                        return gson.toJson(Map.of("message", "Lahan berhasil dihapus"));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal menghapus lahan: ID tidak ditemukan."));
                    
                } catch (NumberFormatException e) {
                    res.status(400); 
                    return gson.toJson(Map.of("error", "ID lahan harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error DELETE /api/lahan/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat hapus."));
                }
            });
        });
    }
}