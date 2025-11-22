package com.farmmanagement.repository;

import java.util.List;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.HasilPanen;

public class HasilPanenRepository {

    // Ambil semua data hasil panen
    public List<HasilPanen> findAll() {
        String sql = "SELECT * FROM hasil_panen";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            // Mapping otomatis dari kolom DB ke field model HasilPanen
            return conn.createQuery(sql).executeAndFetch(HasilPanen.class);
        }
    }

    // Ambil hasil panen berdasarkan ID
    public HasilPanen findById(int id) {
        String sql = "SELECT * FROM hasil_panen WHERE id_hasil = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("id", id)
                       .executeAndFetchFirst(HasilPanen.class);
        }
    }

    // Tambah hasil panen baru
    public boolean insert(HasilPanen hasilPanen) {
        String sql = "INSERT INTO hasil_panen (id_tanaman, id_lahan, id_pengawas, tanggal_panen, " +
                     "kuantitas, kualitas, harga_satuan, status) " +
                     "VALUES (:id_tanaman, :id_lahan, :id_pengawas, :tanggal_panen, " +
                     ":kuantitas, :kualitas, :harga_satuan, :status)";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_tanaman", hasilPanen.getId_tanaman())
                             .addParameter("id_lahan", hasilPanen.getId_lahan())
                             .addParameter("id_pengawas", hasilPanen.getId_pengawas())
                             .addParameter("tanggal_panen", hasilPanen.getTanggal_panen())
                             .addParameter("kuantitas", hasilPanen.getKuantitas())
                             .addParameter("kualitas", hasilPanen.getKualitas())
                             .addParameter("harga_satuan", hasilPanen.getHarga_satuan())
                             .addParameter("status", hasilPanen.getStatus())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    

    // Update hasil panen berdasarkan ID
    public boolean update(HasilPanen hasilPanen) {
        String sql = "UPDATE hasil_panen SET id_tanaman = :id_tanaman, id_lahan = :id_lahan, " +
                     "id_pengawas = :id_pengawas, tanggal_panen = :tanggal_panen, kuantitas = :kuantitas, " +
                     "kualitas = :kualitas, harga_satuan = :harga_satuan, status = :status " +
                     "WHERE id_hasil = :id_hasil";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_hasil", hasilPanen.getId_hasil())
                             .addParameter("id_tanaman", hasilPanen.getId_tanaman())
                             .addParameter("id_lahan", hasilPanen.getId_lahan())
                             .addParameter("id_pengawas", hasilPanen.getId_pengawas())
                             .addParameter("tanggal_panen", hasilPanen.getTanggal_panen())
                             .addParameter("kuantitas", hasilPanen.getKuantitas())
                             .addParameter("kualitas", hasilPanen.getKualitas())
                             .addParameter("harga_satuan", hasilPanen.getHarga_satuan())
                             .addParameter("status", hasilPanen.getStatus())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    // Hapus hasil panen berdasarkan ID
    public boolean delete(int id) {
        String sql = "DELETE FROM hasil_panen WHERE id_hasil = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id", id)
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}
