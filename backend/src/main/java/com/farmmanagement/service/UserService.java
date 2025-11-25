package com.farmmanagement.service;

import java.util.List;

import org.mindrot.jbcrypt.BCrypt;

import com.farmmanagement.model.User;
import com.farmmanagement.repository.UserRepository;

public class UserService {

    private final UserRepository userRepository = new UserRepository();

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    // --- Authentication ---
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && BCrypt.checkpw(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public boolean checkPassword(String rawPassword, String hashedPassword) {
        return BCrypt.checkpw(rawPassword, hashedPassword);
    }

    public boolean register(String username, String password, String role, String nama) {
        // Cek duplikasi username sebelum menyimpan
        if (userRepository.findByUsername(username) != null) {
            return false;
        }
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt());
        User user = new User(username, hashed, role, nama);
        return userRepository.save(user);
    }

    public boolean resetPassword(String username, String oldPassword, String newPassword) {
        User user = findByUsername(username);
        if (user == null) return false;
        if (!BCrypt.checkpw(oldPassword, user.getPassword())) return false;
    
        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        return userRepository.update(user); // gunakan repository, bukan saveUser
    }
    
    // --- CRUD Manager (Pengawas Management) ---
    // Ambil user berdasarkan ID (tanpa password)
    public User getUserById(int id) {
        return userRepository.findById(id); 
    }

    // Ambil semua user berdasarkan role (misal 'pengawas')
    public List<User> getUsersByRole(String role) {
        return userRepository.findAllByRole(role);
    }

    // Update user (digunakan Admin untuk mengelola Pengawas)
    public boolean updateUser(User user) {
        // 1. Ambil data user lama untuk cek password lama
        User existingUser = userRepository.findById(user.getId_user());
        if (existingUser == null) {
            return false; // User tidak ditemukan
        }
        
        // 2. Jika password diisi, hash password baru
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            String newHashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
            user.setPassword(newHashedPassword);
        } else {
            // Jika password kosong, pastikan tidak ikut di-update di SQL
            user.setPassword(null); 
        }

        return userRepository.update(user);
    }

    // Hapus user
    public boolean deleteUser(int id) {
        return userRepository.delete(id);
    }
}