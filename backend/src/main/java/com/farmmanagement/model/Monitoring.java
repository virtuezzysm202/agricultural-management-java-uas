package com.farmmanagement.model;

import java.sql.Timestamp;

public class Monitoring {
    private int id_monitor;
    private int id_lahan;
    private double suhu;
    private double kelembaban;
    private Timestamp tanggal;

    // Constructor kosong
    public Monitoring() {
    }

    // Constructor dengan parameter
    public Monitoring(int id_monitor, int id_lahan, double suhu, double kelembaban, Timestamp tanggal) {
        this.id_monitor = id_monitor;
        this.id_lahan = id_lahan;
        this.suhu = suhu;
        this.kelembaban = kelembaban;
        this.tanggal = tanggal;
    }

    // Getters dan Setters
    public int getId_monitor() {
        return id_monitor;
    }

    public void setId_monitor(int id_monitor) {
        this.id_monitor = id_monitor;
    }

    public int getId_lahan() {
        return id_lahan;
    }

    public void setId_lahan(int id_lahan) {
        this.id_lahan = id_lahan;
    }

    public double getSuhu() {
        return suhu;
    }

    public void setSuhu(double suhu) {
        this.suhu = suhu;
    }

    public double getKelembaban() {
        return kelembaban;
    }

    public void setKelembaban(double kelembaban) {
        this.kelembaban = kelembaban;
    }

    public Timestamp getTanggal() {
        return tanggal;
    }

    public void setTanggal(Timestamp tanggal) {
        this.tanggal = tanggal;
    }
}
