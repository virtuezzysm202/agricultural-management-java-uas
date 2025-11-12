package com.farmmanagement.controller;

import com.farmmanagement.model.User;
import com.farmmanagement.service.UserService;
import com.farmmanagement.util.JwtUtil;
import com.google.gson.Gson;

import java.util.Map;

import static spark.Spark.*;

public class UserController {

    private final UserService userService = new UserService();
    private final Gson gson = new Gson();

    public UserController() {
        path("/api/user", () -> {
            // REGISTER
            post("/register", (req, res) -> {
                User u = gson.fromJson(req.body(), User.class);
                boolean success = userService.register(u.getUsername(), u.getPassword(), u.getRole(), u.getNama());
                res.type("application/json");
                return success ? gson.toJson(Map.of("message", "User created")) 
                               : gson.toJson(Map.of("error", "Registration failed"));
            });

            // LOGIN
            post("/login", (req, res) -> {
                User u = gson.fromJson(req.body(), User.class);
                User logged = userService.login(u.getUsername(), u.getPassword());
                res.type("application/json");

                if (logged != null) {
                    String token = JwtUtil.generateToken(logged.getUsername(), logged.getRole());
                    logged.setPassword(null);

                    return gson.toJson(Map.of(
                        "message", "Login successful",
                        "token", token,
                        "user", logged
                    ));
                } else {
                    res.status(401);
                    return gson.toJson(Map.of("error", "Invalid credentials"));
                }
            });
        });
    }
}
