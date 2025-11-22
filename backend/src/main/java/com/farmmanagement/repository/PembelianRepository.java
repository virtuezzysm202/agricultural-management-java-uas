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
        String sql = "INSERT INTO pembelian (id_pembeli, id_hasil, tanggal, jumlah, total_harga) " +
                     "VALUES (:id_pembeli, :id_hasil, :tanggal, :jumlah, :total_harga)";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_pembeli", pembelian.getId_pembeli())
                             .addParameter("id_hasil", pembelian.getId_hasil())
                             .addParameter("tanggal", pembelian.getTanggal())
                             .addParameter("jumlah", pembelian.getJumlah())
                             .addParameter("total_harga", pembelian.getTotal_harga())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    // Update pembelian berdasarkan ID
    public boolean update(Pembelian pembelian) {
        String sql = "UPDATE pembelian SET id_pembeli = :id_pembeli, id_hasil = :id_hasil, " +
                     "tanggal = :tanggal, jumlah = :jumlah, total_harga = :total_harga " +
                     "WHERE id_pembelian = :id_pembelian";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_pembelian", pembelian.getId_pembelian())
                             .addParameter("id_pembeli", pembelian.getId_pembeli())
                             .addParameter("id_hasil", pembelian.getId_hasil())
                             .addParameter("tanggal", pembelian.getTanggal())
                             .addParameter("jumlah", pembelian.getJumlah())
                             .addParameter("total_harga", pembelian.getTotal_harga())
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