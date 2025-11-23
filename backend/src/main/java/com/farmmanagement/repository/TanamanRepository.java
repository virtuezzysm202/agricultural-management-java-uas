package com.farmmanagement.repository;

import java.util.List;

import org.sql2o.Connection;

import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.Tanaman;

public class TanamanRepository {

    //  Ambil semua data tanaman
    public List<Tanaman> findAll() {
        String sql = "SELECT * FROM tanaman";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql).executeAndFetch(Tanaman.class);
        }
    }

    //  Ambil tanaman berdasarkan ID
    public Tanaman findById(int id) {
        String sql = "SELECT * FROM tanaman WHERE id_tanaman = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("id", id)
                       .executeAndFetchFirst(Tanaman.class);
        }
    }

    //  Tambah tanaman baru
    public boolean save(Tanaman tanaman) {
        String sql = "INSERT INTO tanaman (nama_tanaman, jenis, waktu_tanam, jumlah_tanaman) VALUES (:nama_tanaman, :jenis, :waktu_tanam, :jumlah_tanaman)";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("nama_tanaman", tanaman.getNama_tanaman())
                             .addParameter("jenis", tanaman.getJenis())
                             .addParameter("waktu_tanam", tanaman.getWaktu_tanam())
                             .addParameter("jumlah_tanaman", tanaman.getJumlah_tanaman())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    //  Update tanaman berdasarkan ID
    public boolean update(Tanaman tanaman) {
        String sql = "UPDATE tanaman SET nama_tanaman = :nama_tanaman, jenis = :jenis, waktu_tanam = :waktu_tanam, jumlah_tanaman = :jumlah_tanaman WHERE id_tanaman = :id_tanaman";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_tanaman", tanaman.getId_tanaman())
                             .addParameter("nama_tanaman", tanaman.getNama_tanaman())
                             .addParameter("jenis", tanaman.getJenis())
                             .addParameter("waktu_tanam", tanaman.getWaktu_tanam())
                             .addParameter("jumlah_tanaman", tanaman.getJumlah_tanaman())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    //  Hapus tanaman berdasarkan ID
    public boolean delete(int id) {
        String sql = "DELETE FROM tanaman WHERE id_tanaman = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id", id)
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}
