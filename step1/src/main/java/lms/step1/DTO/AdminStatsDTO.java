// AdminStatsDTO.java
package lms.step1.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsDTO {
    private long totalUsers;
    private long studentCount;
    private long instructorCount;
    private long courseCount;
    private long enrollmentCount;
}

