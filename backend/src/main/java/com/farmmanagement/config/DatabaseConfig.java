package com.farmmanagement.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.sql2o.Sql2o;

public class DatabaseConfig {
    private static Sql2o sql2o;

    static {
        try {
            // Load environment variables from .env
            Dotenv dotenv = Dotenv.load();

            String url = dotenv.get("DB_URL");
            String user = dotenv.get("DB_USER");
            String pass = dotenv.get("DB_PASSWORD");

            // Validate configuration
            if (url == null || user == null || pass == null) {
                throw new RuntimeException("Database configuration is incomplete. Check your .env file.");
            }

            sql2o = new Sql2o(url, user, pass);
            System.out.println("✅ Database connected: " + url);
            
            // Test connection
            try (org.sql2o.Connection conn = sql2o.open()) {
                conn.createQuery("SELECT 1").executeScalar();
                System.out.println("✅ Database connection test successful");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to connect to database");
            e.printStackTrace();
            throw new RuntimeException("❌ Failed to load database configuration: " + e.getMessage());
        }
    }

    public static Sql2o getSql2o() {
        return sql2o;
    }
}