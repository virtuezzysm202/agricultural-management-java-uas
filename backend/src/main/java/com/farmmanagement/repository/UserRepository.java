package com.farmmanagement.repository;

import java.util.List;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.User;

public class UserRepository {

    // --- FIND ---
    public User findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = :username";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("username", username)
                       .executeAndFetchFirst(User.class);
        }
    }
    
    // Cari berdasarkan ID
    public User findById(int id) {
        String sql = "SELECT id_user, username, role, nama FROM users WHERE id_user = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("id", id)
                       .executeAndFetchFirst(User.class);
        }
    }

    //Cari semua user berdasarkan role
    public List<User> findAllByRole(String role) {
        String sql = "SELECT id_user, username, role, nama FROM users WHERE role = :role";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("role", role)
                       .executeAndFetch(User.class);
        }
    }
    
    // --- CREATE ---
    public boolean save(User user) {
        // Asumsi: id_user adalah auto-increment
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
    
    // --- UPDATE ---
    // Update user (termasuk password jika tidak null)
    public boolean update(User user) {
        // Hati-hati: Asumsi password sudah di-hash di Service jika tidak null
        String sql = "UPDATE users SET username = :username, nama = :nama" + 
                     (user.getPassword() != null && !user.getPassword().isEmpty() ? ", password = :password" : "") +
                     " WHERE id_user = :id_user";
        
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            org.sql2o.Query query = conn.createQuery(sql)
                .addParameter("id_user", user.getId_user())
                .addParameter("username", user.getUsername())
                .addParameter("nama", user.getNama());
            
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                query.addParameter("password", user.getPassword());
            }
            
            int result = query.executeUpdate().getResult();
            return result > 0;
        }
    }
    
    // --- DELETE ---
    // Hapus user
    public boolean delete(int id) {
        String sql = "DELETE FROM users WHERE id_user = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id", id)
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}