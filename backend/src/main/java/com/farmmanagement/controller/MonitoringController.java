package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;
import com.farmmanagement.model.Monitoring;
import com.farmmanagement.service.MonitoringService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import static spark.Spark.*;

public class MonitoringController {
    private static final MonitoringService monitoringService = new MonitoringService();
    private static final Gson gson = new GsonBuilder().serializeNulls().create();

    // =====================================================
    // Helper Role Checking
    // =====================================================
    private static boolean isAdmin(String role) {
        return role != null && role.equalsIgnoreCase("admin");
    }

    private static boolean isManager(String role) {
        return role != null && role.equalsIgnoreCase("manager");
    }

    public static void registerRoutes() {
        path("/api/monitoring", () -> {

            // ==========================================================
            // POST - Tambah monitoring (Manager Only)
            // ==========================================================
            post("", (req, res) -> {
                res.type("application/json");
                String role = req.headers("Role");

                if (!isManager(role)) {
                    res.status(403);
                    return gson.toJson(Map.of("error", "Akses ditolak. Hanya Manajer yang dapat menambah monitoring."));
                }

                try {
                    Monitoring monitoring = gson.fromJson(req.body(), Monitoring.class);

                    if (monitoring.getId_lahan() <= 0 ||
                        monitoring.getSuhu() <= 0 ||
                        monitoring.getKelembaban() <= 0 ||
                        monitoring.getTanggal() == null) 
                    {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data monitoring tidak lengkap atau tidak valid."));
                    }

                    boolean ok = monitoringService.addMonitoring(monitoring);

                    if (ok) {
                        res.status(201);
                        return gson.toJson(Map.of("message", "Monitoring berhasil ditambahkan"));
                    }

                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal menambahkan data monitoring."));

                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });


            // ==========================================================
            // GET - Semua monitoring (Admin + Manager)
            // ==========================================================
            get("", (req, res) -> {
                res.type("application/json");
                String role = req.headers("Role");

                if (!isAdmin(role) && !isManager(role)) {
                    res.status(403);
                    return gson.toJson(Map.of("error", "Akses ditolak."));
                }

                try {
                    List<Monitoring> list = monitoringService.getAllMonitoring();
                    return gson.toJson(list);
                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data monitoring."));
                }
            });


            // ==========================================================
            // GET - Monitoring by ID (Admin + Manager)
            // ==========================================================
            get("/:id", (req, res) -> {
                res.type("application/json");
                String role = req.headers("Role");

                if (!isAdmin(role) && !isManager(role)) {
                    res.status(403);
                    return gson.toJson(Map.of("error", "Akses ditolak."));
                }

                try {
                    int id = Integer.parseInt(req.params("id"));
                    Monitoring monitoring = monitoringService.getMonitoringById(id);

                    if (monitoring != null) return gson.toJson(monitoring);

                    res.status(404);
                    return gson.toJson(Map.of("error", "Monitoring tidak ditemukan"));

                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID harus berupa angka."));
                }
            });


            // ==========================================================
            // PUT - Update monitoring (Admin + Manager)
            // ==========================================================
            put("/:id", (req, res) -> {
                res.type("application/json");
                String role = req.headers("Role");

                if (!isAdmin(role) && !isManager(role)) {
                    res.status(403);
                    return gson.toJson(Map.of("error", "Akses ditolak."));
                }

                try {
                    int id = Integer.parseInt(req.params("id"));
                    Monitoring monitoring = gson.fromJson(req.body(), Monitoring.class);
                    monitoring.setId_monitor(id);

                    if (monitoring.getSuhu() < 0 || monitoring.getKelembaban() < 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data monitoring tidak valid."));
                    }

                    boolean ok = monitoringService.updateMonitoring(monitoring);

                    if (ok) return gson.toJson(Map.of("message", "Monitoring berhasil diperbarui"));

                    res.status(404);
                    return gson.toJson(Map.of("error", "ID monitoring tidak ditemukan."));

                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });


            // ==========================================================
            // DELETE - Hapus monitoring (Manager Only)
            // ==========================================================
            delete("/:id", (req, res) -> {
                res.type("application/json");
                String role = req.headers("Role");

                if (!isManager(role)) {
                    res.status(403);
                    return gson.toJson(Map.of("error", "Akses ditolak. Hanya Manajer yang dapat menghapus monitoring."));
                }

                try {
                    int id = Integer.parseInt(req.params("id"));
                    boolean ok = monitoringService.deleteMonitoring(id);

                    if (ok) return gson.toJson(Map.of("message", "Monitoring berhasil dihapus"));

                    res.status(404);
                    return gson.toJson(Map.of("error", "ID monitoring tidak ditemukan."));

                } catch (Exception e) {
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });

        });
    }
}
