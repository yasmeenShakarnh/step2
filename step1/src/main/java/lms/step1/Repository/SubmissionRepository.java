package lms.step1.Repository;

import lms.step1.Model.Assignment;
import lms.step1.Model.AssignmentSubmission;
import lms.step1.Model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

// في حزمة lms.step1.Repository

import lms.step1.Model.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    // يمكنك إضافة استعلامات مخصصة هنا إذا لزم الأمر
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    boolean existsByAssignmentAndStudent(Assignment assignment, User student);
// In SubmissionRepository.java
List<AssignmentSubmission> findByAssignment(Assignment assignment);
    Optional<AssignmentSubmission> findByAssignmentAndStudent(Assignment assignment, User student);

    
}