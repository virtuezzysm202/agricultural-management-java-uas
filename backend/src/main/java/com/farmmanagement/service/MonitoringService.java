package com.farmmanagement.service;

import java.util.List;
import com.farmmanagement.model.Monitoring;
import com.farmmanagement.repository.MonitoringRepository;

public class MonitoringService {
    private final MonitoringRepository repo = new MonitoringRepository();

    public List<Monitoring> getAllMonitoring() {
        return repo.findAll();
    }

    public Monitoring getMonitoringById(int id) {
        return repo.findById(id);
    }

    public boolean addMonitoring(Monitoring monitoring) {
        return repo.save(monitoring);
    }

    public boolean updateMonitoring(Monitoring monitoring) {
        return repo.update(monitoring);
    }

    public boolean deleteMonitoring(int id) {
        return repo.delete(id);
    }
}
