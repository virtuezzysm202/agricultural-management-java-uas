package com.farmmanagement.service;

import com.farmmanagement.model.User;
import com.farmmanagement.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;

public class UserService {

    private final UserRepository userRepository = new UserRepository();

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && BCrypt.checkpw(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public boolean register(String username, String password, String role, String nama) {
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt());
        User user = new User(username, hashed, role, nama);
        return userRepository.save(user);
    }
}

