package com.farmmanagement.service;

import java.util.List;

import com.farmmanagement.model.Monitoring;
import com.farmmanagement.repository.MonitoringRepository;

public class MonitoringService {
    private final MonitoringRepository repo = new MonitoringRepository();

    public boolean addMonitoring(Monitoring monitoring) {
        return repo.insert(monitoring);
    }

    public List<Monitoring> getAllMonitoring() {
        return repo.findAll();
    }

    public Monitoring getMonitoringById(int id) {
        return repo.findById(id);
    }

    public boolean updateMonitoring(Monitoring monitoring) {
        return repo.update(monitoring);
    }

    public boolean deleteMonitoring(int id) {
        return repo.delete(id);
    }
}
