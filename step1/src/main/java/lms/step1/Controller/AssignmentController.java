package lms.step1.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lms.step1.DTO.AssignmentDTO;
import lms.step1.DTO.AssignmentSubmissionDTO;
import lms.step1.Service.AssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/assignments", produces = "application/json")
@RequiredArgsConstructor
@Slf4j
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<?> createAssignment(
            @RequestParam("assignmentDTO") String assignmentDTOJson,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("courseId") Long courseId) {
        try {
            AssignmentDTO assignmentDTO = objectMapper.readValue(assignmentDTOJson, AssignmentDTO.class);

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("⚠️ File is missing or empty. Please upload a valid file.");
            }

            AssignmentDTO savedAssignment = assignmentService.createAssignment(assignmentDTO, courseId, file);
            EntityModel<AssignmentDTO> resource = EntityModel.of(savedAssignment);
            Link selfLink = WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(AssignmentController.class)
                    .getAssignmentById(savedAssignment.getId())).withSelfRel();
            resource.add(selfLink);

            return ResponseEntity.status(HttpStatus.CREATED).body(resource);
        } catch (JsonProcessingException e) {
            return ResponseEntity.badRequest().body("⚠️ Error parsing JSON: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN','STUDENT')")
    @GetMapping("/{assignmentId}")
    public ResponseEntity<EntityModel<AssignmentDTO>> getAssignmentById(@PathVariable Long assignmentId) {
        AssignmentDTO assignmentDTO = assignmentService.getAssignmentById(assignmentId);
        EntityModel<AssignmentDTO> resource = EntityModel.of(assignmentDTO);
        Link selfLink = WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(AssignmentController.class)
                .getAssignmentById(assignmentId)).withSelfRel();
        resource.add(selfLink);

        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(AssignmentController.class)
                .updateAssignment(assignmentId, assignmentDTO)).withRel("update"));

        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(AssignmentController.class)
                .deleteAssignment(assignmentId)).withRel("delete"));

        return ResponseEntity.ok(resource);
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN','STUDENT')")
    @GetMapping
    public ResponseEntity<List<AssignmentDTO>> getAllAssignments() {
        List<AssignmentDTO> assignments = assignmentService.getAllAssignments();
        for (AssignmentDTO assignment : assignments) {
            assignment.add(Link.of("http://localhost:8080/assignments/" + assignment.getId()).withSelfRel());
            assignment.add(Link.of("http://localhost:8080/assignments/" + assignment.getId() + "/upload").withRel("upload"));
            assignment.add(Link.of("http://localhost:8080/assignments/" + assignment.getId()).withRel("delete"));
        }
        return ResponseEntity.ok(assignments);
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @PostMapping(value = "/{assignmentId}/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadAssignmentFile(
            @PathVariable Long assignmentId,
            @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("⚠️ File is missing or empty.");
        }

        assignmentService.uploadFile(assignmentId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header("Location", "http://localhost:8080/assignments/" + assignmentId + "/upload")
                .body("✅ File uploaded successfully.");
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @PutMapping("/{assignmentId}")
    public ResponseEntity<?> updateAssignment(
            @PathVariable Long assignmentId,
            @RequestBody AssignmentDTO assignmentDTO) {
        AssignmentDTO updated = assignmentService.updateAssignment(assignmentId, assignmentDTO);
        EntityModel<AssignmentDTO> resource = EntityModel.of(updated);
        resource.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(AssignmentController.class)
                .getAssignmentById(assignmentId)).withSelfRel());
        return ResponseEntity.ok(resource);
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<String> deleteAssignment(@PathVariable Long assignmentId) {
        assignmentService.deleteAssignment(assignmentId);
        return ResponseEntity.ok("✅ Assignment deleted with ID: " + assignmentId);
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN','STUDENT')")
    @GetMapping("/{assignmentId}/download")
    public ResponseEntity<Resource> downloadAssignmentFile(@PathVariable Long assignmentId) {
        try {
            return assignmentService.downloadAssignmentFile(assignmentId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN','STUDENT')")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByCourseId(@PathVariable Long courseId) {
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsByCourseId(courseId);
        return ResponseEntity.ok(assignments);
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionDTO>> getAllSubmissionsForAssignment(@PathVariable Long assignmentId) {
        List<AssignmentSubmissionDTO> submissions = assignmentService.getAllSubmissionsByAssignmentId(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping(value = "/{assignmentId}/submit", consumes = "multipart/form-data")
    public ResponseEntity<?> submitAssignmentSolution(
            @PathVariable Long assignmentId,
            @RequestParam(value = "solutionText", required = false) String solutionText,
            @RequestParam(value = "solutionFile", required = false) MultipartFile solutionFile) {
        try {
            if ((solutionText == null || solutionText.trim().isEmpty()) &&
                    (solutionFile == null || solutionFile.isEmpty())) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Either text or file is required"));
            }

            if (solutionFile != null && !solutionFile.isEmpty()) {
                if (solutionFile.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File exceeds 5MB"));
                }

                String contentType = solutionFile.getContentType();
                if (contentType == null || (!contentType.startsWith("application/") && !contentType.equals("text/plain"))) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid file type"));
                }
            }

            assignmentService.submitSolution(assignmentId, solutionText, solutionFile);
            return ResponseEntity.ok(Map.of("success", true, "message", "Submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/{assignmentId}/user-submission")
    public ResponseEntity<?> getUserSubmission(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> response = assignmentService.getUserSubmissionDetails(assignmentId, username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @PutMapping("/submissions/{submissionId}/feedback")
    public ResponseEntity<?> addFeedback(
            @PathVariable Long submissionId,
            @RequestBody Map<String, String> feedbackRequest) {
        try {
            String feedback = feedbackRequest.get("feedback");
            if (feedback == null || feedback.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Feedback cannot be empty"));
            }

            AssignmentSubmissionDTO updated = assignmentService.addFeedback(submissionId, feedback);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/submissions/{submissionId}/download")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long submissionId) {
        try {
            Resource resource = assignmentService.getSubmissionFileResource(submissionId);
            String filename = resource.getFilename();
            if (filename != null && filename.contains("_")) {
                filename = filename.substring(filename.lastIndexOf("_") + 1);
            } else {
                filename = "submission.pdf";
            }

            String contentType = Files.probeContentType(resource.getFile().toPath());
            if (contentType == null) contentType = "application/pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ByteArrayResource("File download failed".getBytes()));
        }
    }
}
