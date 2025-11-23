package com.farmmanagement.repository;

import java.util.List;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.Pembelian;

public class PembelianRepository {

    // Ambil semua data pembelian
    public List<Pembelian> findAll() {
        String sql = "SELECT * FROM pembelian";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql).executeAndFetch(Pembelian.class);
        }
    }

    // Ambil pembelian berdasarkan ID
    public Pembelian findById(int id) {
        String sql = "SELECT * FROM pembelian WHERE id_pembelian = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("id", id)
                       .executeAndFetchFirst(Pembelian.class);
        }
    }

    // Tambah pembelian baru
    public boolean insert(Pembelian pembelian) {
        // Set default status if not provided
        if (pembelian.getStatus() == null || pembelian.getStatus().trim().isEmpty()) {
            pembelian.setStatus("Diproses");
        }
        
        String sql = "INSERT INTO pembelian (id_pembeli, id_penjual, id_hasil, id_tanaman, tanggal, jumlah, total_harga, status) " +
                     "VALUES (:id_pembeli, :id_penjual, :id_hasil, :id_tanaman, :tanggal, :jumlah, :total_harga, :status)";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_pembeli", pembelian.getId_pembeli())
                             .addParameter("id_penjual", pembelian.getId_penjual())
                             .addParameter("id_hasil", pembelian.getId_hasil())
                             .addParameter("id_tanaman", pembelian.getId_tanaman())
                             .addParameter("tanggal", pembelian.getTanggal())
                             .addParameter("jumlah", pembelian.getJumlah())
                             .addParameter("total_harga", pembelian.getTotal_harga())
                             .addParameter("status", pembelian.getStatus())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    // Update pembelian berdasarkan ID
    public boolean update(Pembelian pembelian) {
        String sql = "UPDATE pembelian SET id_pembeli = :id_pembeli, id_penjual = :id_penjual, id_hasil = :id_hasil, id_tanaman = :id_tanaman, " +
                     "tanggal = :tanggal, jumlah = :jumlah, total_harga = :total_harga, status = :status " +
                     "WHERE id_pembelian = :id_pembelian";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_pembelian", pembelian.getId_pembelian())
                             .addParameter("id_pembeli", pembelian.getId_pembeli())
                             .addParameter("id_penjual", pembelian.getId_penjual())
                             .addParameter("id_hasil", pembelian.getId_hasil())
                             .addParameter("id_tanaman", pembelian.getId_tanaman())
                             .addParameter("tanggal", pembelian.getTanggal())
                             .addParameter("jumlah", pembelian.getJumlah())
                             .addParameter("total_harga", pembelian.getTotal_harga())
                             .addParameter("status", pembelian.getStatus())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    // Hapus pembelian berdasarkan ID
    public boolean delete(int id) {
        String sql = "DELETE FROM pembelian WHERE id_pembelian = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id", id)
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}