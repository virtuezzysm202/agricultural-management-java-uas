package com.farmmanagement.service;

import java.util.List;

import com.farmmanagement.model.TanamanLahan;
import com.farmmanagement.repository.TanamanLahanRepository;

public class TanamanLahanService {
    private final TanamanLahanRepository repo = new TanamanLahanRepository();

    public List<TanamanLahan> getAllTanamanLahan() {
        return repo.findAll();
    }

    public TanamanLahan getTanamanLahanById(int id) {
        return repo.findById(id);
    }

    public boolean addTanamanLahan(TanamanLahan tanamanLahan) {
        return repo.save(tanamanLahan);
    }

    public boolean updateTanamanLahan(TanamanLahan tanamanLahan) {
        return repo.update(tanamanLahan);
    }

    public boolean deleteTanamanLahan(int id) {
        return repo.delete(id);
    }
}
