package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;
import com.farmmanagement.model.Lahan;
import com.farmmanagement.service.LahanService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import static spark.Spark.*;

public class LahanController {

    private static final LahanService lahanService = new LahanService();
    private static final Gson gson = new GsonBuilder().create();

    // Helper untuk cek role
    private static boolean isManager(String role) {
        return role != null && role.equalsIgnoreCase("manajer");
    }

    public static void registerRoutes() {
        path("/api/lahan", () -> {

            // GET semua lahan (hanya manajer)
            get("", (req, res) -> {
                res.type("application/json");
                String role = req.headers("Role");
                if (!isManager(role)) {
                    res.status(403);
                    return gson.toJson(Map.of("error", "Akses ditolak. Hanya manajer yang dapat melihat lahan."));
                }
                List<Lahan> list = lahanService.getAllLahan();
                return gson.toJson(list);
            });

            // GET lahan by ID (hanya manajer)
            get("/:id", (req, res) -> {
                res.type("application/json");
                String role = req.headers("Role");
                if (!isManager(role)) {
                    res.status(403);
                    return gson.toJson(Map.of("error", "Akses ditolak. Hanya manajer yang dapat melihat lahan."));
                }
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Lahan l = lahanService.getLahanById(id);
                    if (l != null) return gson.toJson(l);
                    res.status(404);
                    return gson.toJson(Map.of("error", "Lahan tidak ditemukan"));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID lahan harus berupa angka."));
                }
            });

            // POST tambah lahan
            post("", (req, res) -> {
                res.type("application/json");
                Lahan l = gson.fromJson(req.body(), Lahan.class);

                if (l.getNama_lahan() == null || l.getNama_lahan().isEmpty()
                        || l.getLuas() <= 0 || l.getId_pengawas() <= 0) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "Data lahan tidak valid."));
                }

                boolean ok = lahanService.addLahan(l);

                if (ok) {
                    res.status(201);
                    return gson.toJson(Map.of("message", "Lahan berhasil ditambahkan"));
                }
                res.status(400);
                return gson.toJson(Map.of("error", "Gagal menambahkan lahan"));
            });

            // PUT update lahan
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Lahan l = gson.fromJson(req.body(), Lahan.class);

                    l.setId_lahan(id);

                    boolean ok = lahanService.updateLahan(l);

                    if (ok) return gson.toJson(Map.of("message", "Lahan berhasil diperbarui"));

                    res.status(404);
                    return gson.toJson(Map.of("error", "ID lahan tidak ditemukan"));

                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID tidak valid."));
                }
            });

            // DELETE lahan
            delete("/:id", (req, res) -> {
                res.type("application/json");
                int id = Integer.parseInt(req.params("id"));
                boolean ok = lahanService.deleteLahan(id);

                if (ok) return gson.toJson(Map.of("message", "Lahan dihapus"));

                res.status(404);
                return gson.toJson(Map.of("error", "ID tidak ditemukan"));
            });
        });
    }
}
