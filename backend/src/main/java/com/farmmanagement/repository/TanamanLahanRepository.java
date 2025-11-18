package com.farmmanagement.repository;

import java.util.List;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.TanamanLahan;

public class TanamanLahanRepository {

    // Ambil semua data tanaman lahan
    public List<TanamanLahan> findAll() {
        String sql = "SELECT * FROM tanaman_lahan";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql).executeAndFetch(TanamanLahan.class);
        }
    }

    // Ambil tanaman lahan berdasarkan ID
    public TanamanLahan findById(int id) {
        String sql = "SELECT * FROM tanaman_lahan WHERE id_tl = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("id", id)
                       .executeAndFetchFirst(TanamanLahan.class);
        }
    }

    // Update tanaman lahan berdasarkan ID
    public boolean update(TanamanLahan tanamanLahan) {
        String sql = "UPDATE tanaman_lahan SET id_lahan = :id_lahan, id_tanaman = :id_tanaman, " +
                     "tanggal_tanam = :tanggal_tanam, status = :status " +
                     "WHERE id_tl = :id_tl";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_tl", tanamanLahan.getId_tl())
                             .addParameter("id_lahan", tanamanLahan.getId_lahan())
                             .addParameter("id_tanaman", tanamanLahan.getId_tanaman())
                             .addParameter("tanggal_tanam", tanamanLahan.getTanggal_tanam())
                             .addParameter("status", tanamanLahan.getStatus())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    // Tambah tanaman lahan baru
    public boolean save(TanamanLahan tanamanLahan) {
        String sql = "INSERT INTO tanaman_lahan (id_lahan, id_tanaman, tanggal_tanam, status) " +
                     "VALUES (:id_lahan, :id_tanaman, :tanggal_tanam, :status)";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_lahan", tanamanLahan.getId_lahan())
                             .addParameter("id_tanaman", tanamanLahan.getId_tanaman())
                             .addParameter("tanggal_tanam", tanamanLahan.getTanggal_tanam())
                             .addParameter("status", tanamanLahan.getStatus())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    // Hapus tanaman lahan berdasarkan ID
    public boolean delete(int id) {
        String sql = "DELETE FROM tanaman_lahan WHERE id_tl = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id", id)
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}
