package lms.step1.DTO;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AssignmentSubmissionDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String solutionText;
    private String solutionFileUrl;
    private LocalDateTime submissionDate;
    private String feedback;
    private LocalDateTime feedbackDate;
}