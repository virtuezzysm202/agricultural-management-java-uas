package com.farmmanagement;

import static spark.Spark.*;
import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.controller.AdminController;
import com.farmmanagement.controller.BuyerController;
import com.farmmanagement.controller.ManagerController;
import com.farmmanagement.controller.UserController;
import com.farmmanagement.middleware.AuthMiddleware;


import org.sql2o.Connection;

public class App {
    public static void main(String[] args) {
        port(8081); // set port

        // Test DB Connection
        try (Connection con = DatabaseConfig.getSql2o().open()) {
            Integer result = con.createQuery("SELECT 1").executeScalar(Integer.class);
            System.out.println("Database test query result: " + result);
        } catch (Exception e) {
            System.err.println("Database connection failed: " + e.getMessage());
        }

          // Registrasi middleware global
        AuthMiddleware.register();

         // Controller routes
        new UserController();          // sudah otomatis di path("/api/user", ...)
        AdminController.registerRoutes();
        ManagerController.registerRoutes();
        BuyerController.registerRoutes();



        // Simple endpoint
        get("/hello", (req, res) -> "Farm Management Backend Running ✅");

        // Auth
        new UserController(); // inisialisasi route auth
        System.out.println("Backend running on port 8081");
    }
}
