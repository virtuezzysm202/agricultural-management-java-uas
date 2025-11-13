package com.farmmanagement.repository;

import java.util.List;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.Lahan;

public class LahanRepository {

    //  Ambil semua data lahan
    public List<Lahan> findAll() {
        String sql = "SELECT * FROM lahan";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            // Mapping otomatis dari kolom DB ke field model Lahan
            return conn.createQuery(sql).executeAndFetch(Lahan.class);
        }
    }

    //  Ambil lahan berdasarkan ID
    public Lahan findById(int id) {
        String sql = "SELECT * FROM lahan WHERE id_lahan = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("id", id)
                       .executeAndFetchFirst(Lahan.class);
        }
    }

    //  Tambah lahan baru
    public boolean save(Lahan lahan) {
        String sql = "INSERT INTO lahan (nama_lahan, luas, lokasi, id_pengawas) VALUES (:nama_lahan, :luas, :lokasi, :id_pengawas)";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("nama_lahan", lahan.getNama_lahan())
                             .addParameter("luas", lahan.getLuas())
                             .addParameter("lokasi", lahan.getLokasi())
                             .addParameter("id_pengawas", lahan.getId_pengawas())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    //  Update lahan berdasarkan ID
    public boolean update(Lahan lahan) {
        String sql = "UPDATE lahan SET nama_lahan = :nama_lahan, luas = :luas, lokasi = :lokasi, id_pengawas = :id_pengawas WHERE id_lahan = :id_lahan";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_lahan", lahan.getId_lahan())
                             .addParameter("nama_lahan", lahan.getNama_lahan())
                             .addParameter("luas", lahan.getLuas())
                             .addParameter("lokasi", lahan.getLokasi())
                             .addParameter("id_pengawas", lahan.getId_pengawas())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    //  Hapus lahan berdasarkan ID
    public boolean delete(int id) {
        String sql = "DELETE FROM lahan WHERE id_lahan = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id", id)
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}