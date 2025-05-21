package lms.step1.Service;

import lms.step1.DTO.AssignInstructorDTO;
import lms.step1.DTO.CourseDTO;
import lms.step1.DTO.StudentCourseDTO;
import java.util.List;
import java.util.stream.Collectors;

public interface CourseService {
     CourseDTO createCourse(CourseDTO courseDTO);
    CourseDTO updateCourse(Long id, CourseDTO courseDTO);
    void deleteCourse(Long id);
    CourseDTO getCourseById(Long id);
    List<CourseDTO> getAllCourses();
    void assignInstructor(AssignInstructorDTO request);
    List<CourseDTO> getRecentCoursesForStudent(String username);
    List<CourseDTO> getRecentCoursesForInstructor(String username);
    List<CourseDTO> getRecentCourses();
    void sendCourseUpdateNotification(String email, String courseTitle, String description, int duration);
    List<StudentCourseDTO> getInstructorStudents(String instructorUsername);
}
