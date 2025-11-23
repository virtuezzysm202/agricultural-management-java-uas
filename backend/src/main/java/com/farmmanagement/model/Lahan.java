package com.farmmanagement.model;

import java.sql.Timestamp;

public class Lahan {
    private int id_lahan;
    private String nama_lahan;
    private double luas; // Menggunakan double/float untuk menampung data desimal (luas)
    private String lokasi;
    private int id_pengawas; // Foreign Key
    private Timestamp created_at;

    public Lahan() {}

    public Lahan(int id_lahan, String nama_lahan, double luas, String lokasi, int id_pengawas, Timestamp created_at) {
        this.id_lahan = id_lahan;
        this.nama_lahan = nama_lahan;
        this.luas = luas;
        this.lokasi = lokasi;
        this.id_pengawas = id_pengawas;
        this.created_at = created_at;
    }

    // Getter & Setter
    public int getId_lahan() {
        return id_lahan;
    }

    public void setId_lahan(int id_lahan) {
        this.id_lahan = id_lahan;
    }

    public String getNama_lahan() {
        return nama_lahan;
    }

    public void setNama_lahan(String nama_lahan) {
        this.nama_lahan = nama_lahan;
    }

    public double getLuas() {
        return luas;
    }

    public void setLuas(double luas) {
        this.luas = luas;
    }

    public String getLokasi() {
        return lokasi;
    }

    public void setLokasi(String lokasi) {
        this.lokasi = lokasi;
    }

    public int getId_pengawas() {
        return id_pengawas;
    }

    public void setId_pengawas(int id_pengawas) {
        this.id_pengawas = id_pengawas;
    }

    public Timestamp getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Timestamp created_at) {
        this.created_at = created_at;
    }
}