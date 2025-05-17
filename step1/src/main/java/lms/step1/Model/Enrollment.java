// Enrollment.java
package lms.step1.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private boolean completed = false;

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDate enrolledAt; // تم تغيير الاسم إلى enrolledAt

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDate.now();
    }
}