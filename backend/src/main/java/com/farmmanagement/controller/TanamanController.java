package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.Tanaman;
import com.farmmanagement.service.TanamanService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder; // Import tambahan

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class TanamanController {

    private static final TanamanService tanamanService = new TanamanService();
    
    // REVISI: Menggunakan GsonBuilder untuk mengatur format tanggal (e.g., "yyyy-MM-dd")
    // Ini memperbaiki error parsing tanggal seperti '2025-11-13' menjadi java.util.Date/java.sql.Date
    private static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd") 
            .create();

    public static void registerRoutes() {
        path("/api/tanaman", () -> {

            // GET semua tanaman
            get("", (req, res) -> {
                res.type("application/json");
                try {
                    List<Tanaman> list = tanamanService.getAllTanaman();
                    return gson.toJson(list);
                } catch (Exception e) {
                    System.err.println("Error GET /api/tanaman: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data tanaman dari database."));
                }
            });

            // GET by id
            get("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Tanaman t = tanamanService.getTanamanById(id);
                    if (t != null) return gson.toJson(t);
                    res.status(404);
                    return gson.toJson(Map.of("error", "Tanaman tidak ditemukan"));
                } catch (NumberFormatException e) {
                    res.status(400); // Bad Request jika ID bukan angka
                    return gson.toJson(Map.of("error", "ID tanaman harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error GET /api/tanaman/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });

            // POST tambah tanaman
            post("", (req, res) -> {
                res.type("application/json");
                
                try {
                    // Pastikan body tidak null/kosong
                    if (req.body() == null || req.body().trim().isEmpty()) {
                         res.status(400);
                         return gson.toJson(Map.of("error", "Body request tidak boleh kosong."));
                    }
                    
                    Tanaman t = gson.fromJson(req.body(), Tanaman.class);
                    
                    // Lakukan validasi dasar sebelum memanggil service
                    if (t.getNama_tanaman() == null || t.getNama_tanaman().isEmpty()) {
                         res.status(400);
                         return gson.toJson(Map.of("error", "Nama tanaman tidak boleh kosong."));
                    }
                    
                    boolean ok = tanamanService.addTanaman(t);
                    
                    if (ok) {
                        res.status(201); // 201 Created
                        return gson.toJson(Map.of("message", "Tanaman berhasil ditambahkan"));
                    }
                    
                    // Jika service gagal karena alasan lain (misalnya validasi service atau DB error)
                    res.status(400); 
                    return gson.toJson(Map.of("error", "Gagal menambahkan tanaman, cek data input."));
                    
                } catch (com.google.gson.JsonSyntaxException e) {
                    // Tangkap jika format JSON yang dikirim frontend salah (termasuk error parsing tanggal yang sudah diperbaiki)
                    System.err.println("JSON Parsing Error (POST /tanaman): " + e.getMessage());
                    res.status(400); 
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah. Detail: " + e.getMessage()));
                } catch (Exception e) {
                    // TANGKAP SEMUA EXCEPTION LAIN (Termasuk dari Service/DB)
                    System.err.println("!!! UNHANDLED EXCEPTION (POST /api/tanaman) !!!");
                    e.printStackTrace(); // Cetak Stack Trace ke konsol Java
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error: Gagal menyimpan data. Cek konsol backend Anda."));
                }
            });

            // PUT update tanaman
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Tanaman t = gson.fromJson(req.body(), Tanaman.class);
                    // Pastikan ID dari URL digunakan, dan bukan dari body (jika ada)
                    t.setId_tanaman(id); 
                    
                    // Lakukan validasi dasar sebelum memanggil service
                    if (t.getNama_tanaman() == null || t.getNama_tanaman().isEmpty()) {
                         res.status(400);
                         return gson.toJson(Map.of("error", "Nama tanaman tidak boleh kosong."));
                    }
                    
                    boolean ok = tanamanService.updateTanaman(t);
                    
                    if (ok) {
                        return gson.toJson(Map.of("message", "Tanaman berhasil diperbarui"));
                    }
                    
                    res.status(404); // Jika update gagal, mungkin ID tidak ditemukan
                    return gson.toJson(Map.of("error", "Gagal memperbarui tanaman: ID tidak ditemukan atau data salah."));
                    
                } catch (NumberFormatException e) {
                    res.status(400); // Bad Request jika ID bukan angka
                    return gson.toJson(Map.of("error", "ID tanaman harus berupa angka."));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT /tanaman): " + e.getMessage());
                    res.status(400); 
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah."));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/tanaman/:id:");
                    e.printStackTrace();
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update."));
                }
            });

            // DELETE hapus tanaman
            delete("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    boolean ok = tanamanService.deleteTanaman(id);
                    
                    if (ok) {
                        return gson.toJson(Map.of("message", "Tanaman berhasil dihapus"));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal menghapus tanaman: ID tidak ditemukan."));
                    
                } catch (NumberFormatException e) {
                    res.status(400); // Bad Request jika ID bukan angka
                    return gson.toJson(Map.of("error", "ID tanaman harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error DELETE /api/tanaman/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat hapus."));
                }
            });
        });
    }
}