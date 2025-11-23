package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.Pembelian;
import com.farmmanagement.service.PembelianService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.put;

public class PembelianController {
    private static final PembelianService pembelianService = new PembelianService();
    private static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd HH:mm:ss")
            .serializeNulls()
            .create();

    public static void registerRoutes() {
        path("/api/manager/pembelian", () -> {

            // GET semua pembelian
            get("", (req, res) -> {
                res.type("application/json");
                try {
                    List<Pembelian> list = pembelianService.getAllPembelian();
                    return gson.toJson(Map.of(
                        "status", "success",
                        "message", "Daftar pembelian berhasil diambil",
                        "data", list
                    ));
                } catch (Exception e) {
                    System.err.println("Error GET /api/pembelian: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data pembelian dari database."));
                }
            });

            // GET pembelian by id
            get("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Pembelian pembelian = pembelianService.getPembelianById(id);
                    
                    if (pembelian != null) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Pembelian ditemukan",
                            "data", pembelian
                        ));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Pembelian tidak ditemukan"));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID pembelian harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error GET /api/pembelian/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });

            

            // PUT update pembelian
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Pembelian pembelian = gson.fromJson(req.body(), Pembelian.class);
                    pembelian.setId_pembelian(id);

                    if (pembelian.getJumlah() <= 0 || pembelian.getTotal_harga() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data pembelian tidak lengkap atau tidak valid."));
                    }

                    boolean ok = pembelianService.updatePembelian(pembelian);
                    if (ok) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Pembelian berhasil diperbarui"
                        ));
                    }
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal memperbarui pembelian: ID tidak ditemukan atau data salah."));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID pembelian harus berupa angka."));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT /pembelian): " + e.getMessage());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah."));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/pembelian/:id:");
                    e.printStackTrace();
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update."));
                }
            });

            // DELETE hapus pembelian
            delete("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    boolean ok = pembelianService.deletePembelian(id);
                    if (ok) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Pembelian berhasil dihapus"
                        ));
                    }
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal menghapus pembelian: ID tidak ditemukan."));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID pembelian harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error DELETE /api/pembelian/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat hapus."));
                }
            });
        });
    }
}