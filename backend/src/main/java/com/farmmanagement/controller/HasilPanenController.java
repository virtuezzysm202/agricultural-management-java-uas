package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.HasilPanen;
import com.farmmanagement.service.HasilPanenService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.put;

public class HasilPanenController {

    private static final HasilPanenService hasilPanenService = new HasilPanenService();
    // Menggunakan Gson dengan serializeNulls untuk handle null values
    private static final Gson gson = new GsonBuilder().serializeNulls().create();

    public static void registerRoutes() {
        path("/api/hasil_panen", () -> {

            // GET semua hasil panen
            get("", (req, res) -> {
                res.type("application/json");
                try {
                    List<HasilPanen> list = hasilPanenService.getAllHasilPanen();
                    return gson.toJson(list);
                } catch (Exception e) {
                    System.err.println("Error GET /api/hasil_panen: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data hasil panen dari database."));
                }
            });

            // GET hasil panen by id
            get("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    HasilPanen hasilPanen = hasilPanenService.getHasilPanenById(id);
                    if (hasilPanen != null) return gson.toJson(hasilPanen);
                    res.status(404);
                    return gson.toJson(Map.of("error", "Hasil panen tidak ditemukan"));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID hasil panen harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error GET /api/hasil_panen/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });

            // PUT update hasil panen
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    HasilPanen hasilPanen = gson.fromJson(req.body(), HasilPanen.class);
                    hasilPanen.setId_hasil(id);

                    if (hasilPanen.getKuantitas() <= 0 || hasilPanen.getHarga_satuan() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data hasil panen tidak lengkap atau tidak valid."));
                    }

                    boolean ok = hasilPanenService.updateHasilPanen(hasilPanen);

                    if (ok) {
                        return gson.toJson(Map.of("message", "Hasil panen berhasil diperbarui"));
                    }

                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal memperbarui hasil panen: ID tidak ditemukan atau data salah."));

                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID hasil panen harus berupa angka."));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT /hasil_panen): " + e.getMessage());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah."));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/hasil_panen/:id:");
                    e.printStackTrace();
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update."));
                }
            });

            // DELETE hapus hasil panen
            delete("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    boolean ok = hasilPanenService.deleteHasilPanen(id);

                    if (ok) {
                        return gson.toJson(Map.of("message", "Hasil panen berhasil dihapus"));
                    }

                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal menghapus hasil panen: ID tidak ditemukan."));

                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID hasil panen harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error DELETE /api/hasil_panen/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat hapus."));
                }
            });
        });
    }
}
