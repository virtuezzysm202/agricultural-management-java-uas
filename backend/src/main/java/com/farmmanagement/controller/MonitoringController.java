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

    public static void registerRoutes() {
        path("/api/monitoring", () -> {

            // GET semua monitoring
            get("", (req, res) -> {
                res.type("application/json");
                try {
                    List<Monitoring> list = monitoringService.getAllMonitoring();
                    return gson.toJson(list);
                } catch (Exception e) {
                    System.err.println("Error GET /api/monitoring: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data monitoring dari database."));
                }
            });

            // GET monitoring by id
            get("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Monitoring monitoring = monitoringService.getMonitoringById(id);
                    if (monitoring != null) return gson.toJson(monitoring);
                    res.status(404);
                    return gson.toJson(Map.of("error", "Monitoring tidak ditemukan"));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID monitoring harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error GET /api/monitoring/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error."));
                }
            });

            // PUT update monitoring
            put("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Monitoring monitoring = gson.fromJson(req.body(), Monitoring.class);
                    monitoring.setId_monitor(id);

                    if (monitoring.getSuhu() < 0 || monitoring.getKelembaban() < 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Data monitoring tidak lengkap atau tidak valid."));
                    }

                    boolean ok = monitoringService.updateMonitoring(monitoring);
                    if (ok) {
                        return gson.toJson(Map.of("message", "Monitoring berhasil diperbarui"));
                    }
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal memperbarui monitoring: ID tidak ditemukan atau data salah."));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID monitoring harus berupa angka."));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT /monitoring): " + e.getMessage());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON yang dikirim salah."));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/monitoring/:id:");
                    e.printStackTrace();
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update."));
                }
            });

            // DELETE hapus monitoring
            delete("/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    boolean ok = monitoringService.deleteMonitoring(id);
                    if (ok) {
                        return gson.toJson(Map.of("message", "Monitoring berhasil dihapus"));
                    }
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal menghapus monitoring: ID tidak ditemukan."));
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID monitoring harus berupa angka."));
                } catch (Exception e) {
                    System.err.println("Error DELETE /api/monitoring/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat hapus."));
                }
            });
        });
    }
}
