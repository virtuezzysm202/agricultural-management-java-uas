package com.farmmanagement.service;

import java.util.List;

import com.farmmanagement.model.HasilPanen;
import com.farmmanagement.repository.HasilPanenRepository;

public class HasilPanenService {
    private final HasilPanenRepository repo = new HasilPanenRepository();

    public List<HasilPanen> getAllHasilPanen() {
        return repo.findAll();
    }

    public HasilPanen getHasilPanenById(int id) {
        return repo.findById(id);
    }

    public boolean updateHasilPanen(HasilPanen hasilPanen) {
        // Tambahkan validasi jika diperlukan
        return repo.update(hasilPanen);
    }

    public boolean deleteHasilPanen(int id) {
        return repo.delete(id);
    }
}
