package lms.step1.Service;
import lms.step1.DTO.AssignInstructorDTO;
import lms.step1.DTO.CourseDTO;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface CourseService {
    CourseDTO createCourse(CourseDTO courseDTO);
    CourseDTO updateCourse(Long id, CourseDTO courseDTO);
    void deleteCourse(Long id);
    CourseDTO getCourseById(Long id);
    List<CourseDTO> getAllCourses();
    void assignInstructor(AssignInstructorDTO request);
    void sendCourseUpdateNotification(String email, String courseTitle, String description, int duration);
    List<CourseDTO> getRecentCoursesForStudent(String username, Pageable pageable);
    List<CourseDTO> getRecentCoursesForInstructor(String username, Pageable pageable);
    List<CourseDTO> getRecentCourses(Pageable pageable);
}
