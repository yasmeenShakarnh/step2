package lms.step1.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCourseDTO {
    private Long studentId;
    private String firstName;
    private String lastName;
    private String courseTitle;
    private Long courseId;
} 