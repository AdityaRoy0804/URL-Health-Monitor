package in.akr.URLMonitor.dto;

import in.akr.URLMonitor.entity.HealthStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HealthRecordResponseDTO {
    private Long id;
    private HealthStatus status;
    private Integer statusCode;
    private Long responseTime;
    private String errorMessage;
    private LocalDateTime checkedAt;
}
