package lms.step1.Service;

import lms.step1.DTO.AssignmentDTO;
import lms.step1.DTO.AssignmentSubmissionDTO;
import lms.step1.Model.Assignment;
import lms.step1.Model.AssignmentSubmission;
import lms.step1.Model.Course;
import lms.step1.Model.User;
import lms.step1.Repository.AssignmentRepository;
import lms.step1.Repository.SubmissionRepository;
import lms.step1.Repository.CourseRepository;
import lms.step1.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @Transactional
    public AssignmentDTO createAssignment(AssignmentDTO assignmentDTO, Long courseId, MultipartFile file) {
        log.info("Creating assignment for course ID: {}", courseId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.error("Course not found with id: {}", courseId);
                    return new RuntimeException("Course not found with id: " + courseId);
                });

        Assignment assignment = new Assignment();
        assignment.setTitle(assignmentDTO.getTitle());
        assignment.setDescription(assignmentDTO.getDescription());
        assignment.setDueDate(assignmentDTO.getDueDate());
        assignment.setAllowResubmissions(assignmentDTO.isAllowResubmissions());
        assignment.setCourse(course);

        Assignment savedAssignment = assignmentRepository.save(assignment);
        log.info("Assignment saved with ID: {}", savedAssignment.getId());

        if (file != null && !file.isEmpty()) {
            String filePath = saveFile(file, savedAssignment.getId());
            log.info("File uploaded successfully: {}", filePath);
        }

        return convertToDTO(savedAssignment);
    }

    public void uploadFile(Long assignmentId, MultipartFile file) {
        log.info("Uploading file for assignment ID: {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.error("Assignment not found with id: {}", assignmentId);
                    return new RuntimeException("Assignment not found with id: " + assignmentId);
                });

        if (file != null && !file.isEmpty()) {
            String filePath = saveFile(file, assignmentId);
            log.info("File uploaded at path: {}", filePath);
        } else {
            log.warn("Empty file received for assignment ID: {}", assignmentId);
        }
    }

    public List<AssignmentDTO> getAllAssignments() {
        log.info("Fetching all assignments...");
        return assignmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDTO updateAssignment(Long assignmentId, AssignmentDTO assignmentDTO) {
        log.info("Updating assignment with ID: {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.error("Assignment not found with id: {}", assignmentId);
                    return new RuntimeException("Assignment not found with id: " + assignmentId);
                });

        assignment.setTitle(assignmentDTO.getTitle());
        assignment.setDescription(assignmentDTO.getDescription());
        assignment.setDueDate(assignmentDTO.getDueDate());
        assignment.setAllowResubmissions(assignmentDTO.isAllowResubmissions());

        Assignment updatedAssignment = assignmentRepository.save(assignment);
        log.info("Assignment updated with ID: {}", updatedAssignment.getId());

        return convertToDTO(updatedAssignment);
    }

   

    public AssignmentDTO getAssignmentById(Long assignmentId) {
        log.info("Fetching assignment with ID: {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.error("Assignment not found with id: {}", assignmentId);
                    return new RuntimeException("Assignment not found with id: " + assignmentId);
                });

        return convertToDTO(assignment);
    }

    public List<AssignmentDTO> getAssignmentsByCourseId(Long courseId) {
        log.info("Fetching assignments for course ID: {}", courseId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.error("Course not found with id: {}", courseId);
                    return new RuntimeException("Course not found with id: " + courseId);
                });

        return assignmentRepository.findByCourse(course).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String saveFile(MultipartFile file, Long assignmentId) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String fileName = "assignment_" + assignmentId + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());

            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));

            assignment.setFilePath(filePath.toString());
            assignmentRepository.save(assignment);

            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Error saving file", e);
        }
    }

    public ResponseEntity<Resource> downloadAssignmentFile(Long assignmentId) throws IOException {
        log.info("Downloading file for assignment ID: {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.error("Assignment not found with id: {}", assignmentId);
                    return new RuntimeException("Assignment not found with id: " + assignmentId);
                });

        if (assignment.getFilePath() == null || assignment.getFilePath().isEmpty()) {
            log.warn("No file found for assignment ID: {}", assignmentId);
            throw new RuntimeException("No file found for this assignment");
        }

        Path path = Paths.get(assignment.getFilePath());
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            log.error("File not found or not readable: {}", path);
            throw new RuntimeException("Could not read the file");
        }

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    private User getCurrentStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<AssignmentSubmissionDTO> getAllSubmissionsByAssignmentId(Long assignmentId) {
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        return submissions.stream()
                .map(this::convertToSubmissionDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> checkUserSubmission(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        User currentStudent = getCurrentStudent();
        
        Optional<AssignmentSubmission> submission = submissionRepository
                .findByAssignmentAndStudent(assignment, currentStudent);
        
        Map<String, Object> response = new HashMap<>();
        response.put("exists", submission.isPresent());
        response.put("submissionId", submission.map(AssignmentSubmission::getId).orElse(null));
        
        return response;
    }

    public boolean hasUserSubmittedAssignment(Long assignmentId, String username) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return submissionRepository.existsByAssignmentAndStudent(assignment, student);
    }

    public Long getUserSubmissionId(Long assignmentId, String username) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return submissionRepository.findByAssignmentAndStudent(assignment, student)
                .map(AssignmentSubmission::getId)
                .orElse(null);
    }

    @Transactional
    public void submitSolution(Long assignmentId, String solutionText, MultipartFile solutionFile) {
        // Get current authenticated student
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get the assignment
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // Check if already submitted (unless resubmissions allowed)
        if (!assignment.isAllowResubmissions() && 
            submissionRepository.existsByAssignmentAndStudent(assignment, student)) {
            throw new RuntimeException("You have already submitted this assignment");
        }

        // Validate due date
        if (LocalDateTime.now().isAfter(assignment.getDueDate())) {
            throw new RuntimeException("Cannot submit after due date");
        }

        // Validate file type if present
        if (solutionFile != null && !solutionFile.isEmpty()) {
            String contentType = solutionFile.getContentType();
            if (!"application/pdf".equals(contentType)) {
                throw new RuntimeException("Only PDF files are allowed");
            }
        }

        // Create new submission
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSolutionText(solutionText);
        submission.setSubmissionDate(LocalDateTime.now());
        
        // Handle file upload if present
        if (solutionFile != null && !solutionFile.isEmpty()) {
            try {
                String fileName = storeFile(solutionFile);
                submission.setSolutionFilePath(fileName);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload solution file: " + e.getMessage());
            }
        }
        
        submissionRepository.save(submission);
    }

    private String storeFile(MultipartFile file) throws IOException {
        // إنشاء مجلد التحميل إذا لم يكن موجوداً
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // الحفاظ على امتداد الملف الأصلي
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = "submission_" + UUID.randomUUID() + fileExtension;
        
        Path filePath = uploadPath.resolve(fileName);
        
        // حفظ الملف
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return filePath.toString(); // إرجاع المسار الكامل للملف
    }

    public Map<String, Object> getUserSubmissionDetails(Long assignmentId, String username) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<AssignmentSubmission> submission = submissionRepository
                .findByAssignmentAndStudent(assignment, student);
        
        Map<String, Object> response = new HashMap<>();
        response.put("exists", submission.isPresent());
        
        if (submission.isPresent()) {
            AssignmentSubmission sub = submission.get();
            response.put("submissionId", sub.getId());
            response.put("feedback", sub.getFeedback());
            response.put("feedbackDate", sub.getFeedbackDate());
            response.put("submissionDate", sub.getSubmissionDate());
            response.put("solutionText", sub.getSolutionText());
            response.put("solutionFileUrl", sub.getSolutionFilePath());
            
            response.put("allowResubmission", 
                assignment.isAllowResubmissions() && 
                LocalDateTime.now().isBefore(assignment.getDueDate()));
        }
        
        return response;
    }

    @Transactional
    public AssignmentSubmissionDTO addFeedback(Long submissionId, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));
        
        submission.setFeedback(feedback);
        submission.setFeedbackDate(LocalDateTime.now());
        
        AssignmentSubmission updated = submissionRepository.save(submission);
        return convertToSubmissionDTO(updated);
    }

    private AssignmentDTO convertToDTO(Assignment assignment) {
        return AssignmentDTO.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .maxScore(assignment.getMaxScore())
                .courseId(assignment.getCourse().getId())
                .allowResubmissions(assignment.isAllowResubmissions())
                .build();
    }

    private AssignmentSubmissionDTO convertToSubmissionDTO(AssignmentSubmission submission) {
        return AssignmentSubmissionDTO.builder()
                .id(submission.getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getUsername())
                .solutionText(submission.getSolutionText())
                .solutionFileUrl(submission.getSolutionFilePath())
                .submissionDate(submission.getSubmissionDate())
                .feedback(submission.getFeedback())
                .feedbackDate(submission.getFeedbackDate())
                .build();
    }

    public Resource getSubmissionFileResource(Long submissionId) throws IOException {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        if (submission.getSolutionFilePath() == null || submission.getSolutionFilePath().isEmpty()) {
            throw new RuntimeException("No file associated with this submission");
        }
        
        Path filePath = Paths.get(submission.getSolutionFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found or not readable");
        }
        
        return resource;
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = Paths.get(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if(resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

   
@Transactional
public void deleteAssignment(Long assignmentId) {
    log.info("Deleting assignment with ID: {}", assignmentId);

    Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> {
                log.error("Assignment not found with id: {}", assignmentId);
                return new RuntimeException("Assignment not found with id: " + assignmentId);
            });

    // 1. حذف الـ submissions المرتبطة
    List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
    submissionRepository.deleteAll(submissions);

    // 2. حذف الملف إذا وُجد
    if (assignment.getFilePath() != null) {
        try {
            Files.deleteIfExists(Paths.get(assignment.getFilePath()));
            log.info("Deleted file: {}", assignment.getFilePath());
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", assignment.getFilePath(), e);
        }
    }

    // 3. حذف الـ assignment نفسه
    assignmentRepository.delete(assignment);
    log.info("Assignment deleted with ID: {}", assignmentId);
}


}