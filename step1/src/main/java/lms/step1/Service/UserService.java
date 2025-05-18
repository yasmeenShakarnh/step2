package lms.step1.Service;

import lms.step1.Model.User;
import lms.step1.Enumeration.Role;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User saveUser(User user);
    Optional<User> findByUsername(String username);
    List<User> findByRole(Role role);
    boolean existsByUsername(String username);
} 