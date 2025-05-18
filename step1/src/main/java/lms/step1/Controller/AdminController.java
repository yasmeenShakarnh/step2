// AdminController.java
package lms.step1.Controller;

import lms.step1.Model.*;
import lms.step1.Enumeration.*;
import lms.step1.Repository.*;
import lms.step1.DTO.UserDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AdminController(UserRepository userRepository, 
                          CourseRepository courseRepository,
                          EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        try {
            Map<String, Long> stats = new HashMap<>();
            stats.put("totalUsers", userRepository.count());
            stats.put("studentCount", userRepository.countByRole(Role.STUDENT));
            stats.put("instructorCount", userRepository.countByRole(Role.INSTRUCTOR));
            stats.put("courseCount", courseRepository.count());
            stats.put("enrollmentCount", enrollmentRepository.count());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching admin stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserDTO> userDTOs = users.stream()
                .map(user -> {
                    UserDTO dto = UserDTO.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .username(user.getUsername())
                        .role(user.getRole())
                        .build();
                    log.info("Mapped user: id={}, email={}, role={}", dto.getId(), dto.getEmail(), dto.getRole());
                    return dto;
                })
                .collect(Collectors.toList());
            log.info("Returning {} users", userDTOs.size());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            log.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        try {
            if (userDTO.getFirstName() == null || userDTO.getFirstName().trim().isEmpty() ||
                userDTO.getLastName() == null || userDTO.getLastName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("First name and last name are required");
            }

            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Only update name fields, preserve the role
            user.setFirstName(userDTO.getFirstName().trim());
            user.setLastName(userDTO.getLastName().trim());

            User updatedUser = userRepository.save(user);
            log.info("User updated successfully: id={}, name={} {}", 
                updatedUser.getId(), 
                updatedUser.getFirstName(), 
                updatedUser.getLastName());

            UserDTO updatedUserDTO = UserDTO.builder()
                .id(updatedUser.getId())
                .firstName(updatedUser.getFirstName())
                .lastName(updatedUser.getLastName())
                .username(updatedUser.getUsername())
                .role(updatedUser.getRole())
                .build();

            return ResponseEntity.ok(updatedUserDTO);
        } catch (RuntimeException e) {
            log.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("An unexpected error occurred");
        }
    }
}
