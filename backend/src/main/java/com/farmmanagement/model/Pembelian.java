package com.farmmanagement.model;

import java.sql.Timestamp;

public class Pembelian {
    private int id_pembelian;
    private int id_pembeli;
    private int id_hasil;
    private int id_tanaman;
    private Timestamp tanggal;
    private double jumlah;
    private double total_harga;
    private String status;

    // Constructor kosong
    public Pembelian() {
    }

    // Constructor dengan parameter
    public Pembelian(int id_pembelian, int id_pembeli, int id_hasil, int id_tanaman, Timestamp tanggal, double jumlah, double total_harga, String status) {
        this.id_pembelian = id_pembelian;
        this.id_pembeli = id_pembeli;
        this.id_hasil = id_hasil;
        this.id_tanaman = id_tanaman;
        this.tanggal = tanggal;
        this.jumlah = jumlah;
        this.total_harga = total_harga;
        this.status = status;
    }

    // Getters dan Setters
    public int getId_pembelian() {
        return id_pembelian;
    }

    public void setId_pembelian(int id_pembelian) {
        this.id_pembelian = id_pembelian;
    }

    public int getId_pembeli() {
        return id_pembeli;
    }

    public void setId_pembeli(int id_pembeli) {
        this.id_pembeli = id_pembeli;
    }

    public int getId_hasil() {
        return id_hasil;
    }

    public void setId_hasil(int id_hasil) {
        this.id_hasil = id_hasil;
    }

    public int getId_tanaman() {
        return id_tanaman;
    }

    public void setId_tanaman(int id_tanaman) {
        this.id_tanaman = id_tanaman;
    }

    public Timestamp getTanggal() {
        return tanggal;
    }

    public void setTanggal(Timestamp tanggal) {
        this.tanggal = tanggal;
    }

    public double getJumlah() {
        return jumlah;
    }

    public void setJumlah(double jumlah) {
        this.jumlah = jumlah;
    }

    public double getTotal_harga() {
        return total_harga;
    }

    public void setTotal_harga(double total_harga) {
        this.total_harga = total_harga;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
