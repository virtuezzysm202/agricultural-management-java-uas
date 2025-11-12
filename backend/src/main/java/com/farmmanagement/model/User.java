package com.farmmanagement.model;

public class User {
    private int id_user;
    private String username;
    private String password;
    private String role;
    private String nama;

    public User() {}

    public User(String username, String password, String role, String nama) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.nama = nama;
    }

    // Getter & Setter
    public int getId_user() {
        return id_user;
    }

    public void setId_user(int id_user) {
        this.id_user = id_user;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        this.nama = nama;
    }
}
