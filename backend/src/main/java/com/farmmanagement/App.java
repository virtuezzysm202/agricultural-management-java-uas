package com.farmmanagement;

import static spark.Spark.*;
import com.farmmanagement.config.DatabaseConfig;
import org.sql2o.Connection;

public class App {
    public static void main(String[] args) {
        port(8080);

        // Test DB Connection
        try (Connection con = DatabaseConfig.getSql2o().open()) {
            Integer result = con.createQuery("SELECT 1").executeScalar(Integer.class);
            System.out.println("Database test query result: " + result);
        } catch (Exception e) {
            System.err.println("Database connection failed: " + e.getMessage());
        }

        // Simple endpoint
        get("/hello", (req, res) -> "Farm Management Backend Running ✅");
    }
}
