package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.TanamanLahan;
import com.farmmanagement.service.TanamanLahanService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.put;

public class TanamanLahanController {
    private static final TanamanLahanService tanamanLahanService = new TanamanLahanService();
    private static final Gson gson = new GsonBuilder().serializeNulls().create();

    public static void registerRoutes() {
        path("/api/tanaman_lahan", () -> {

            // GET semua tanaman lahan
            get("", (req, res) -> {
                res.type("application/json");
                try {
                    List<TanamanLahan> list = tanamanLahanService.getAllTanamanLahan();
                    return gson.toJson(list);
                } catch (Exception e) {
                    System.err.println("Error GET /api/tanaman_lahan: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data tanaman lahan dari database."));
                }
            });

            // GET tanaman lahan by id
            get("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    TanamanLahan tanamanLahan = tanamanLahanService.getTanamanLahanById(id);
                    if (tanamanLahan != null) return gson.toJson(tanamanLahan);
                    res.status(404);
                    return gson.toJson(Map.of("error", "Tanaman lahan tidak ditemukan"));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID tanaman lahan harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error GET /api/tanaman_lahan/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });

            // PUT update tanaman lahan
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    TanamanLahan tanamanLahan = gson.fromJson(req.body(), TanamanLahan.class);
                    tanamanLahan.setId_tl(id);

                    if (tanamanLahan.getStatus() == null || tanamanLahan.getStatus().isEmpty()) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data tanaman lahan tidak lengkap atau tidak valid."));
                    }

                    if (tanamanLahan.getId_pengawas() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID pengawas harus diisi dan valid."));
                    }

                    boolean ok = tanamanLahanService.updateTanamanLahan(tanamanLahan);
                    if (ok) {
                        return gson.toJson(Map.of("message", "Tanaman lahan berhasil diperbarui"));
                    }
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal memperbarui tanaman lahan: ID tidak ditemukan atau data salah."));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID tanaman lahan harus berupa angka."));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT /tanaman_lahan): " + e.getMessage());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah."));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/tanaman_lahan/:id:");
                    e.printStackTrace();
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update."));
                }
            });

            // DELETE hapus tanaman lahan
            delete("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    boolean ok = tanamanLahanService.deleteTanamanLahan(id);
                    if (ok) {
                        return gson.toJson(Map.of("message", "Tanaman lahan berhasil dihapus"));
                    }
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal menghapus tanaman lahan: ID tidak ditemukan."));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID tanaman lahan harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error DELETE /api/tanaman_lahan/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat hapus."));
                }
            });
        });
    }
}
