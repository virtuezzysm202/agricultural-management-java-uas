package com.farmmanagement.model;

import java.sql.Date;

public class TanamanLahan {
    private int id_tl;
    private int id_lahan;
    private int id_tanaman;
    private Date tanggal_tanam;
    private String status; // 'tumbuh', 'panen', 'selesai'
    private int jumlah_tanaman; // Jumlah tanaman yang ditanam di lahan ini

    // Constructor kosong
    public TanamanLahan() {
    }

    // Constructor dengan parameter
    public TanamanLahan(int id_tl, int id_lahan, int id_tanaman, Date tanggal_tanam, String status, int jumlah_tanaman) {
        this.id_tl = id_tl;
        this.id_lahan = id_lahan;
        this.id_tanaman = id_tanaman;
        this.tanggal_tanam = tanggal_tanam;
        this.status = status;
        this.jumlah_tanaman = jumlah_tanaman;
    }

    // Getters dan Setters
    public int getId_tl() {
        return id_tl;
    }

    public void setId_tl(int id_tl) {
        this.id_tl = id_tl;
    }

    public int getId_lahan() {
        return id_lahan;
    }

    public void setId_lahan(int id_lahan) {
        this.id_lahan = id_lahan;
    }

    public int getId_tanaman() {
        return id_tanaman;
    }

    public void setId_tanaman(int id_tanaman) {
        this.id_tanaman = id_tanaman;
    }

    public Date getTanggal_tanam() {
        return tanggal_tanam;
    }

    public void setTanggal_tanam(Date tanggal_tanam) {
        this.tanggal_tanam = tanggal_tanam;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getJumlah_tanaman() {
        return jumlah_tanaman;
    }

    public void setJumlah_tanaman(int jumlah_tanaman) {
        this.jumlah_tanaman = jumlah_tanaman;
    }
}
