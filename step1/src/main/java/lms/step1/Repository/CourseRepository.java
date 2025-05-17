// CourseRepository.java
package lms.step1.Repository;

import lms.step1.Model.Course;
import lms.step1.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
     long count();
    boolean existsByTitle(String title);

    List<Course> findByInstructorId(Long instructorId);

    List<Course> findByInstructor(User instructor);

    // تم توحيد الاستعلامات
    @Query("SELECT c FROM Course c JOIN c.enrollments e WHERE e.student.username = :username ORDER BY e.enrolledAt DESC")
    List<Course> findRecentCoursesByStudent(@Param("username") String username, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.instructor.username = :username ORDER BY c.createdAt DESC")
    List<Course> findRecentCoursesByInstructor(@Param("username") String username, Pageable pageable);

    @Query("SELECT c FROM Course c ORDER BY c.createdAt DESC")
    List<Course> findRecentCourses(Pageable pageable);

    // إزالة الاستعلامات المكررة
    default List<Course> findTop5Recent() {
        return findRecentCourses(PageRequest.of(0, 5));
    }
}