package com.farmmanagement.repository;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.User;

public class UserRepository {

    public User findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = :username";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("username", username)
                       .executeAndFetchFirst(User.class);
        }
    }

    public boolean save(User user) {
        String sql = "INSERT INTO users(username, password, role, nama) VALUES (:username, :password, :role, :nama)";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("username", user.getUsername())
                             .addParameter("password", user.getPassword())
                             .addParameter("role", user.getRole())
                             .addParameter("nama", user.getNama())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}
