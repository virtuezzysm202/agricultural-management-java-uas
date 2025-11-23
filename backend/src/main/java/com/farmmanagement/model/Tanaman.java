package com.farmmanagement.model;

import java.sql.Date; // Import yang benar untuk tipe data SQL Date

public class Tanaman {
    private int id_tanaman;
    private String nama_tanaman;
    private String jenis;
    private Date waktu_tanam; // Menggunakan java.sql.Date agar kompatibel dengan tipe DATE di DB
    private int jumlah_tanaman; // Jumlah tanaman yang tersedia

    public Tanaman() {}

    public Tanaman(int id_tanaman, String nama_tanaman, String jenis, Date waktu_tanam, int jumlah_tanaman) {
        this.id_tanaman = id_tanaman;
        this.nama_tanaman = nama_tanaman;
        this.jenis = jenis;
        this.waktu_tanam = waktu_tanam;
        this.jumlah_tanaman = jumlah_tanaman;
    }

    // Getter & Setter
    public int getId_tanaman() {
        return id_tanaman;
    }

    public void setId_tanaman(int id_tanaman) {
        this.id_tanaman = id_tanaman;
    }

    public String getNama_tanaman() {
        return nama_tanaman;
    }

    public void setNama_tanaman(String nama_tanaman) {
        this.nama_tanaman = nama_tanaman;
    }

    public String getJenis() {
        return jenis;
    }

    public void setJenis(String jenis) {
        this.jenis = jenis;
    }

    // Tipe kembalian dan parameter diubah menjadi java.sql.Date
    public Date getWaktu_tanam() {
        return waktu_tanam;
    }

    public void setWaktu_tanam(Date waktu_tanam) {
        this.waktu_tanam = waktu_tanam;
    }

    public int getJumlah_tanaman() {
        return jumlah_tanaman;
    }

    public void setJumlah_tanaman(int jumlah_tanaman) {
        this.jumlah_tanaman = jumlah_tanaman;
    }
}