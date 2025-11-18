package com.farmmanagement.service;

import java.util.List;
import com.farmmanagement.model.Pembelian;
import com.farmmanagement.repository.PembelianRepository;

public class PembelianService {
    private final PembelianRepository repo = new PembelianRepository();

    public List<Pembelian> getAllPembelian() {
        return repo.findAll();
    }

    public Pembelian getPembelianById(int id) {
        return repo.findById(id);
    }

    public boolean updatePembelian(Pembelian pembelian) {
        return repo.update(pembelian);
    }

    public boolean deletePembelian(int id) {
        return repo.delete(id);
    }
}
