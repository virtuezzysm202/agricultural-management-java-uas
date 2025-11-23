package com.farmmanagement.controller;

import java.util.List;
import java.util.Map;

import com.farmmanagement.model.HasilPanen;
import com.farmmanagement.model.Pembelian;
import com.farmmanagement.service.HasilPanenService;
import com.farmmanagement.service.PembelianService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static spark.Spark.get;
import static spark.Spark.path;
import static spark.Spark.post;

public class BuyerController {
    private static final Gson gson = new GsonBuilder()
        .setDateFormat("yyyy-MM-dd HH:mm:ss")
        .serializeNulls()
        .create();

    private static final PembelianService pembelianService = new PembelianService();
    private static final HasilPanenService hasilPanenService = new HasilPanenService();


    public static void registerRoutes() {
        path("/api/pembeli", () -> {
            get("/dashboard", (req, res) -> {
                res.type("application/json");
                return gson.toJson(Map.of("message", "Welcome to Buyer Dashboard"));
            });

            post("", (req, res) -> {
                res.type("application/json");
                try {
                    System.out.println("Received JSON for pembelian: " + req.body()); // Debug line
                    Pembelian pembelian = gson.fromJson(req.body(), Pembelian.class);
                    
                    // Validation
                    if (pembelian.getId_pembeli() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID pembeli harus valid (lebih dari 0)"));
                    }
                    
                    if (pembelian.getId_hasil() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "ID hasil panen harus valid (lebih dari 0)"));
                    }
                    
                    if (pembelian.getJumlah() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Jumlah harus lebih dari 0"));
                    }
                    
                    if (pembelian.getTotal_harga() <= 0) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Total harga harus lebih dari 0"));
                    }
                    
                    if (pembelian.getTanggal() == null) {
                        res.status(400);
                        return gson.toJson(Map.of("error", "Tanggal pembelian tidak boleh kosong"));
                    }

                    boolean added = pembelianService.addPembelian(pembelian);
                    
                    if (added) {
                        return gson.toJson(Map.of(
                            "status", "success",
                            "message", "Pembelian berhasil ditambahkan"
                        ));
                    }
                    
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal menambahkan pembelian"));
                    
                } catch (com.google.gson.JsonSyntaxException e) {
                    System.err.println("JSON Parsing Error (POST /pembelian): " + e.getMessage());
                    System.err.println("Request body: " + req.body());
                    res.status(400);
                    return gson.toJson(Map.of("error", "Format data JSON tidak valid: " + e.getMessage()));
                } catch (Exception e) {
                    System.err.println("Error POST /api/pembelian: " + e.getMessage());
                    e.printStackTrace();
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error saat menambah pembelian"));
                }
            });

            
            // GET all pembelian
            get("/pembelian", (req, res) -> {
                res.type("application/json");
                try {
                    List<Pembelian> list = pembelianService.getAllPembelian();
                    return gson.toJson(Map.of(
                        "status", "success",
                        "message", "Daftar pembelian berhasil diambil",
                        "data", list
                    ));
                } catch (Exception e) {
                    System.err.println("Error GET /api/pembeli/pembelian: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data pembelian"));
                }
            });

            // GET pembelian by ID
            get("/pembelian/:id", (req, res) -> {
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
                    return gson.toJson(Map.of("error", "ID pembelian harus berupa angka"));
                } catch (Exception e) {
                    System.err.println("Error GET /api/pembeli/pembelian/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error"));
                }
            });

            // GET all hasil panen
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
                    System.err.println("Error GET /api/pembeli/hasil-panen: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Gagal mengambil data hasil panen"));
                }
            });

            // GET hasil panen by ID
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
                    System.err.println("Error GET /api/pembeli/hasil-panen/:id: " + e.getMessage());
                    res.status(500);
                    return gson.toJson(Map.of("error", "Internal Server Error"));
                }
            });


        });
        
    }
}
