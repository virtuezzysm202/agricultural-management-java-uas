package com.farmmanagement.repository;

import java.util.List;
import org.sql2o.Connection;
import com.farmmanagement.config.DatabaseConfig;
import com.farmmanagement.model.Monitoring;

public class MonitoringRepository {

    // Ambil semua data monitoring
    public List<Monitoring> findAll() {
        String sql = "SELECT * FROM monitoring";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql).executeAndFetch(Monitoring.class);
        }
    }

    // Ambil monitoring berdasarkan ID
    public Monitoring findById(int id) {
        String sql = "SELECT * FROM monitoring WHERE id_monitor = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            return conn.createQuery(sql)
                       .addParameter("id", id)
                       .executeAndFetchFirst(Monitoring.class);
        }
    }

    // Update monitoring berdasarkan ID
    public boolean update(Monitoring monitoring) {
        String sql = "UPDATE monitoring SET id_lahan = :id_lahan, suhu = :suhu, " +
                     "kelembaban = :kelembaban, tanggal = :tanggal " +
                     "WHERE id_monitor = :id_monitor";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id_monitor", monitoring.getId_monitor())
                             .addParameter("id_lahan", monitoring.getId_lahan())
                             .addParameter("suhu", monitoring.getSuhu())
                             .addParameter("kelembaban", monitoring.getKelembaban())
                             .addParameter("tanggal", monitoring.getTanggal())
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }

    // Hapus monitoring berdasarkan ID
    public boolean delete(int id) {
        String sql = "DELETE FROM monitoring WHERE id_monitor = :id";
        try (Connection conn = DatabaseConfig.getSql2o().open()) {
            int result = conn.createQuery(sql)
                             .addParameter("id", id)
                             .executeUpdate()
                             .getResult();
            return result > 0;
        }
    }
}
