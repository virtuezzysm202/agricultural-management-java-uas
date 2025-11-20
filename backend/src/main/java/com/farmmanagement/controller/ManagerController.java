package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.HasilPanen;
import com.farmmanagement.model.Monitoring;
import com.farmmanagement.model.Tanaman;
import com.farmmanagement.model.TanamanLahan;
import com.farmmanagement.service.HasilPanenService;
import com.farmmanagement.service.MonitoringService;
import com.farmmanagement.service.TanamanLahanService;
import com.farmmanagement.service.TanamanService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;
import static spark.Spark.put;

public class ManagerController {
    private static final Gson gson = new GsonBuilder().serializeNulls().create();
    private static final HasilPanenService hasilPanenService = new HasilPanenService();
    private static final MonitoringService monitoringService = new MonitoringService();
    private static final TanamanService tanamanService = new TanamanService();
    private static final TanamanLahanService tanamanLahanService = new TanamanLahanService();

    public static void registerRoutes() {
        path("/api/manager", () -> {
            
            // Manager Dashboard
            get("/dashboard", (req, res) -> {
                res.type("application/json");
                return gson.toJson(Map.of("message", "Welcome to Manager Dashboard", "role", "farmer/manager"));
            });

            // ============= HASIL PANEN OPERATIONS (GET & UPDATE ONLY) =============
            
            // GET all hasil panen for manager
            get("/hasil-panen", (req, res) -> {
                res.type("application/json");
                try {
                    List<HasilPanen> list = hasilPanenService.getAllHasilPanen();
                    return gson.toJson(Map.of(
                        "status", "success",
                        "message", "Daftar hasil panen berhasil diambil",
                        "data", list
                    ));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/hasil-panen: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data hasil panen"));
                }
            });

            // GET hasil panen by ID for manager
            get("/hasil-panen/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    HasilPanen hasilPanen = hasilPanenService.getHasilPanenById(id);
                    
                    if (hasilPanen != null) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Hasil panen ditemukan",
                            "data", hasilPanen
                        ));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Hasil panen tidak ditemukan"));
                    
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID hasil panen harus berupa angka"));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/hasil-panen/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error"));
                }
            });

            // UPDATE hasil panen for manager
            put("/hasil-panen/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    HasilPanen hasilPanen = gson.fromJson(req.body(), HasilPanen.class);
                    hasilPanen.setId_hasil(id);

                    // Validation for manager updates
                    if (hasilPanen.getKuantitas() <= 0 || hasilPanen.getHarga_satuan() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Kuantitas dan harga satuan harus lebih dari 0"));
                    }

                    boolean updated = hasilPanenService.updateHasilPanen(hasilPanen);
                    
                    if (updated) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Hasil panen berhasil diperbarui oleh manajer"
                        ));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal memperbarui hasil panen: ID tidak ditemukan"));
                    
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID hasil panen harus berupa angka"));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT hasil-panen): " + e.getMessage());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON tidak valid"));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/manager/hasil-panen/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update"));
                }
            });

            // ============= MONITORING OPERATIONS (GET & UPDATE ONLY) =============
            
            // GET all monitoring data for manager
            get("/monitoring", (req, res) -> {
                res.type("application/json");
                try {
                    List<Monitoring> list = monitoringService.getAllMonitoring();
                    return gson.toJson(Map.of(
                        "status", "success",
                        "message", "Data monitoring berhasil diambil",
                        "data", list
                    ));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/monitoring: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data monitoring"));
                }
            });

            // GET monitoring by ID for manager
            get("/monitoring/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Monitoring monitoring = monitoringService.getMonitoringById(id);
                    
                    if (monitoring != null) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Data monitoring ditemukan",
                            "data", monitoring
                        ));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Data monitoring tidak ditemukan"));
                    
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID monitoring harus berupa angka"));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/monitoring/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error"));
                }
            });

            // UPDATE monitoring data for manager
            put("/monitoring/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Monitoring monitoring = gson.fromJson(req.body(), Monitoring.class);
                    monitoring.setId_monitor(id);

                    // Validation for manager updates
                    if (monitoring.getSuhu() < -50 || monitoring.getSuhu() > 60) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Suhu harus dalam rentang -50°C sampai 60°C"));
                    }
                    
                    if (monitoring.getKelembaban() < 0 || monitoring.getKelembaban() > 100) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Kelembaban harus dalam rentang 0% sampai 100%"));
                    }

                    boolean updated = monitoringService.updateMonitoring(monitoring);
                    
                    if (updated) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Data monitoring berhasil diperbarui oleh manajer"
                        ));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Gagal memperbarui monitoring: ID tidak ditemukan"));
                    
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID monitoring harus berupa angka"));
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (PUT monitoring): " + e.getMessage());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON tidak valid"));
                } catch (Exception e) {
                    System.err.println("Error PUT /api/manager/monitoring/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat update"));
                }
            });

            // ============= TANAMAN OPERATIONS (GET) =============
            
            // GET all tanaman for manager
            get("/tanaman", (req, res) -> {
                res.type("application/json");
                try {
                    List<Tanaman> list = tanamanService.getAllTanaman();
                    return gson.toJson(Map.of(
                        "status", "success",
                        "message", "Daftar tanaman berhasil diambil",
                        "data", list
                    ));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/tanaman: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data tanaman"));
                }
            });

            // GET tanaman by ID for manager
            get("/tanaman/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    Tanaman tanaman = tanamanService.getTanamanById(id);
                    
                    if (tanaman != null) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Tanaman ditemukan",
                            "data", tanaman
                        ));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Tanaman tidak ditemukan"));
                    
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID tanaman harus berupa angka"));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/tanaman/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error"));
                }
            });


            // ============= TANAMAN LAHAN OPERATIONS (GET & ADD) =============
            
            // GET all tanaman lahan for manager
            get("/tanaman-lahan", (req, res) -> {
                res.type("application/json");
                try {
                    List<TanamanLahan> list = tanamanLahanService.getAllTanamanLahan();
                    return gson.toJson(Map.of(
                        "status", "success",
                        "message", "Daftar tanaman lahan berhasil diambil",
                        "data", list
                    ));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/tanaman-lahan: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data tanaman lahan"));
                }
            });

            // GET tanaman lahan by ID for manager
            get("/tanaman-lahan/:id", (req, res) -> {
                res.type("application/json");
                try {
                    int id = Integer.parseInt(req.params("id"));
                    TanamanLahan tanamanLahan = tanamanLahanService.getTanamanLahanById(id);
                    
                    if (tanamanLahan != null) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Tanaman lahan ditemukan",
                            "data", tanamanLahan
                        ));
                    }
                    
                    res.status(404);
                    return gson.toJson(Map.of("error", "Tanaman lahan tidak ditemukan"));
                    
                } catch (NumberFormatException e) {
                    res.status(400);
                    return gson.toJson(Map.of("error", "ID tanaman lahan harus berupa angka"));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/tanaman-lahan/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error"));
                }
            });

            // ADD new tanaman lahan for manager
            post("/tanaman-lahan", (req, res) -> {
                res.type("application/json");
                try {
                    TanamanLahan tanamanLahan = gson.fromJson(req.body(), TanamanLahan.class);
                    
                    // Validation for manager adding tanaman lahan
                    if (tanamanLahan.getId_lahan() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID lahan harus valid (lebih dari 0)"));
                    }
                    
                    if (tanamanLahan.getId_tanaman() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID tanaman harus valid (lebih dari 0)"));
                    }
                    
                    if (tanamanLahan.getTanggal_tanam() == null) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Tanggal tanam tidak boleh kosong"));
                    }
                    
                    if (tanamanLahan.getStatus() == null || tanamanLahan.getStatus().trim().isEmpty()) {
                        // Set default status if not provided
                        tanamanLahan.setStatus("tumbuh");
                    }
                    
                    // Validate status values
                    String status = tanamanLahan.getStatus().toLowerCase();
                    if (!status.equals("tumbuh") && !status.equals("panen") && !status.equals("selesai")) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Status harus 'tumbuh', 'panen', atau 'selesai'"));
                    }

                    boolean added = tanamanLahanService.addTanamanLahan(tanamanLahan);
                    
                    if (added) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Tanaman lahan berhasil ditambahkan oleh manajer"
                        ));
                    }
                    
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal menambahkan tanaman lahan"));
                    
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (POST tanaman-lahan): " + e.getMessage());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON tidak valid"));
                } catch (Exception e) {
                    System.err.println("Error POST /api/manager/tanaman-lahan: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat menambah tanaman lahan"));
                }
            });

            // Summary endpoint for manager dashboard
            get("/summary", (req, res) -> {
                res.type("application/json");
                try {
                    List<HasilPanen> hasilPanenList = hasilPanenService.getAllHasilPanen();
                    List<Monitoring> monitoringList = monitoringService.getAllMonitoring();
                    List<Tanaman> tanamanList = tanamanService.getAllTanaman();
                    List<TanamanLahan> tanamanLahanList = tanamanLahanService.getAllTanamanLahan();
                    
                    return gson.toJson(Map.of(
                        "status", "success",
                        "message", "Summary data untuk manajer",
                        "data", Map.of(
                            "total_hasil_panen", hasilPanenList.size(),
                            "total_monitoring_records", monitoringList.size(),
                            "total_tanaman", tanamanList.size(),
                            "total_tanaman_lahan", tanamanLahanList.size(),
                            "recent_hasil_panen", hasilPanenList.stream().limit(3).toArray(),
                            "recent_monitoring", monitoringList.stream().limit(3).toArray(),
                            "recent_tanaman", tanamanList.stream().limit(3).toArray(),
                            "recent_tanaman_lahan", tanamanLahanList.stream().limit(3).toArray()
                        )
                    ));
                } catch (Exception e) {
                    System.err.println("Error GET /api/manager/summary: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data summary"));
                }
            });
        });
    }
}
