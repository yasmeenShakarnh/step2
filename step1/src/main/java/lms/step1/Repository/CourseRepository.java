package lms.step1.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import lms.step1.Model.Course;
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByTitle(String title);
    Optional<Course> findByInstructorId(Long instructorId);

    @Query("SELECT DISTINCT c FROM Course c " +
           "JOIN c.enrollments e " +
           "WHERE e.student.username = :username " +
           "ORDER BY e.enrolledAt DESC")
    List<Course> findRecentCoursesByStudent(@Param("username") String username);

    @Query("SELECT c FROM Course c " +
           "WHERE c.instructor.username = :username " +
           "ORDER BY c.createdAt DESC")
    List<Course> findRecentCoursesByInstructor(@Param("username") String username);

    List<Course> findTop5ByOrderByCreatedAtDesc();
}