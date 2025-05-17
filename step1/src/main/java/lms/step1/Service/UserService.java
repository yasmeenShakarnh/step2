package lms.step1.Service;

import lms.step1.Model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    User findByUsername(String username);
    User save(User user);
    void delete(Long id);
    User findById(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
} 