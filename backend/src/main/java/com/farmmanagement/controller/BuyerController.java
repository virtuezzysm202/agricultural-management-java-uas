package com.farmmanagement.controller;

import static spark.Spark.*;
import com.google.gson.Gson;
import java.util.Map;

public class BuyerController {
    private static final Gson gson = new Gson();

    public static void registerRoutes() {
        path("/api/pembeli", () -> {
            get("/dashboard", (req, res) -> {
                res.type("application/json");
                return gson.toJson(Map.of("message", "Welcome to Buyer Dashboard"));
            });
        });
    }
}
