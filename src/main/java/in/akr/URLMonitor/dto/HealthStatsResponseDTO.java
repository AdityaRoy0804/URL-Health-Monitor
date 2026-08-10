package in.akr.URLMonitor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HealthStatsResponseDTO {
    private long totalChecks;

    private long successfulChecks;

    private long failedChecks;

    private double uptimePercentage;

    private double averageResponseTime;

    private Long minResponseTime;

    private Long maxResponseTime;
}
