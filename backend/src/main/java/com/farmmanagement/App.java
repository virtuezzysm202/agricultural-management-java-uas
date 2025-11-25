package com.farmmanagement;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.controller.AdminController;
import com.farmmanagement.controller.BuyerController;
import com.farmmanagement.controller.HasilPanenController;
import com.farmmanagement.controller.LahanController;
import com.farmmanagement.controller.ManagerController;
import com.farmmanagement.controller.MonitoringController;
import com.farmmanagement.controller.PembelianController;
import com.farmmanagement.controller.TanamanController;
import com.farmmanagement.controller.TanamanLahanController;
import com.farmmanagement.controller.UserController;
import com.farmmanagement.middleware.AuthMiddleware;
import com.farmmanagement.middleware.RateLimiterMiddleware;

import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.halt;
import static spark.Spark.port;

public class App {

    public static void main(String[] args) {
        port(8081); // Jalankan di port 8081

        //  Setup CORS agar frontend (localhost:5173) bisa akses backend
        enableCORS("http://localhost:5173");

        // Tes koneksi database
        try (Connection con = DatabaseConfig.getSql2o().open()) {
            Integer result = con.createQuery("SELECT 1").executeScalar(Integer.class);
            System.out.println("Database test query result: " + result);
        } catch (Exception e) {
            System.err.println("Database connection failed: " + e.getMessage());
        }

        // Middleware global (JWT auth)
        RateLimiterMiddleware.register();
        AuthMiddleware.register();

        // Register semua routes
        new UserController(); // otomatis path: /api/user
        AdminController.registerRoutes();
        ManagerController.registerRoutes();
        BuyerController.registerRoutes();
        TanamanController.registerRoutes();
        LahanController.registerRoutes();
        HasilPanenController.registerRoutes();
        MonitoringController.registerRoutes();
        TanamanLahanController.registerRoutes();
        PembelianController.registerRoutes();

        // Endpoint test
        get("/hello", (req, res) -> "Farm Management Backend Running ✅");

        System.out.println("✅ Backend running on http://localhost:8081");
    }

    // =========================================================
    //  Fungsi bantu: Setup CORS (Cross-Origin Resource Sharing)
    // =========================================================
    private static void enableCORS(final String origin) {
    before((req, res) -> {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
        res.header("Access-Control-Allow-Credentials", "true");

        if ("OPTIONS".equalsIgnoreCase(req.requestMethod())) {
            halt(200, "OK");
        }
    });
}
}
