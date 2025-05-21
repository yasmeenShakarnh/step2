package lms.step1.Controller;

import lms.step1.DTO.AssignInstructorDTO;
import lms.step1.DTO.CourseDTO;
import lms.step1.DTO.StudentCourseDTO;
import lms.step1.Model.Course;
import lms.step1.Model.User;
import lms.step1.Repository.UserRepository;
import lms.step1.Service.CourseService;
import lms.step1.Service.EmailService;
import lms.step1.Enumeration.*;
import lms.step1.Repository.CourseRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private static final Logger logger = Logger.getLogger(CourseController.class.getName());

    private final CourseService courseService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','INSTRUCTOR')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        try {
            return ResponseEntity.ok(courseService.createCourse(courseDTO));
        } catch (Exception e) {
            logger.severe("Error creating course: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','INSTRUCTOR')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDTO) {
        try {
            return ResponseEntity.ok(courseService.updateCourse(id, courseDTO));
        } catch (Exception e) {
            logger.severe("Error updating course: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.severe("Error deleting course: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(courseService.getCourseById(id));
        } catch (Exception e) {
            logger.severe("Error getting course: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        try {
            return ResponseEntity.ok(courseService.getAllCourses());
        } catch (Exception e) {
            logger.severe("Error getting all courses: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/assign-instructor")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> assignInstructor(@RequestBody AssignInstructorDTO request) {
        try {
            courseService.assignInstructor(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.severe("Error assigning instructor: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/student")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<CourseDTO>> getRecentCoursesForStudent(Authentication authentication) {
        try {
            return ResponseEntity.ok(courseService.getRecentCoursesForStudent(authentication.getName()));
        } catch (Exception e) {
            logger.severe("Error getting student courses: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<CourseDTO>> getRecentCoursesForInstructor(Authentication authentication) {
        try {
            logger.info("Fetching courses for instructor: " + authentication.getName());
            User instructor = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            logger.info("Found instructor with ID: " + instructor.getId());
            
            List<CourseDTO> courses = courseService.getRecentCoursesForInstructor(authentication.getName());
            logger.info("Found " + courses.size() + " courses for instructor");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error getting instructor courses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/instructor/students")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<StudentCourseDTO>> getInstructorStudents(Authentication authentication) {
        try {
            logger.info("Fetching students for instructor: " + authentication.getName());
            User instructor = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            logger.info("Found instructor with ID: " + instructor.getId());
            
            List<StudentCourseDTO> students = courseService.getInstructorStudents(authentication.getName());
            logger.info("Found " + students.size() + " students for instructor");
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            logger.severe("Error getting instructor students: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<List<CourseDTO>> getRecentCourses(Authentication auth) {
        try {
            logger.info("Fetching recent courses for user: " + auth.getName());
            List<CourseDTO> courses;
            
            if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
                courses = courseService.getRecentCoursesForStudent(auth.getName());
            } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR"))) {
                courses = courseService.getRecentCoursesForInstructor(auth.getName());
            } else {
                courses = courseService.getRecentCourses();
            }
            
            logger.info("Found " + courses.size() + " courses");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error getting recent courses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/instructor-courses")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<CourseDTO>> getInstructorCourses(Authentication authentication) {
        try {
            logger.info("Fetching courses for instructor: " + authentication.getName());
            
            // الحصول على المدرس الحالي
            User instructor = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            
            // جلب الكورسات الخاصة بهذا المدرس فقط
            List<CourseDTO> courses = courseService.getCoursesByInstructor(instructor.getId());
            
            logger.info("Found " + courses.size() + " courses for instructor");
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.severe("Error getting instructor courses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/users/instructors")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<User>> getAllInstructors() {
        try {
            logger.info("Fetching all instructors");
            List<User> instructors = userRepository.findByRole(Role.INSTRUCTOR);
            logger.info("Found " + instructors.size() + " instructors");
            return ResponseEntity.ok(instructors);
        } catch (Exception e) {
            logger.severe("Error getting all instructors: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
