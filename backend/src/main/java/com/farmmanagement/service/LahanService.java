package com.farmmanagement.service;

import java.util.List;

import com.farmmanagement.model.Lahan;
import com.farmmanagement.repository.LahanRepository;

public class LahanService {
    private final LahanRepository repo = new LahanRepository();

    public List<Lahan> getAllLahan() {
        return repo.findAll();
    }

    public Lahan getLahanById(int id) {
        return repo.findById(id);
    }

    public boolean addLahan(Lahan l) {
        // Tambahkan validasi, misalnya: l.getLuas() > 0
        return repo.save(l);
    }

    public boolean updateLahan(Lahan l) {
        // Tambahkan validasi, misalnya: l.getLuas() > 0
        return repo.update(l);
    }

    public boolean deleteLahan(int id) {
        return repo.delete(id);
    }
}