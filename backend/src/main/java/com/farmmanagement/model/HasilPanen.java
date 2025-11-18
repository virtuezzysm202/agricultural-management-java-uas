package com.farmmanagement.model;

import java.sql.Date;

/**
 * Model untuk tabel hasil_panen
 * Menyimpan data hasil panen dari lahan
 */
public class HasilPanen {
    private int id_hasil;
    private int id_tanaman;
    private int id_lahan;
    private int id_pengawas;
    private Date tanggal_panen;
    private double kuantitas;
    private String kualitas;
    private double harga_satuan;
    private String status; // 'Menunggu Validasi', 'Siap Dijual', 'Terjual'

    // Constructor kosong (required untuk SQL2O mapping)
    public HasilPanen() {}

    // Constructor lengkap
    public HasilPanen(int id_hasil, int id_tanaman, int id_lahan, int id_pengawas,
                      Date tanggal_panen, double kuantitas, String kualitas,
                      double harga_satuan, String status) {
        this.id_hasil = id_hasil;
        this.id_tanaman = id_tanaman;
        this.id_lahan = id_lahan;
        this.id_pengawas = id_pengawas;
        this.tanggal_panen = tanggal_panen;
        this.kuantitas = kuantitas;
        this.kualitas = kualitas;
        this.harga_satuan = harga_satuan;
        this.status = status;
    }

    // Getters and Setters
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

    public int getId_lahan() {
        return id_lahan;
    }

    public void setId_lahan(int id_lahan) {
        this.id_lahan = id_lahan;
    }

    public int getId_pengawas() {
        return id_pengawas;
    }

    public void setId_pengawas(int id_pengawas) {
        this.id_pengawas = id_pengawas;
    }

    public Date getTanggal_panen() {
        return tanggal_panen;
    }

    public void setTanggal_panen(Date tanggal_panen) {
        this.tanggal_panen = tanggal_panen;
    }

    public double getKuantitas() {
        return kuantitas;
    }

    public void setKuantitas(double kuantitas) {
        this.kuantitas = kuantitas;
    }

    public String getKualitas() {
        return kualitas;
    }

    public void setKualitas(String kualitas) {
        this.kualitas = kualitas;
    }

    public double getHarga_satuan() {
        return harga_satuan;
    }

    public void setHarga_satuan(double harga_satuan) {
        this.harga_satuan = harga_satuan;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
