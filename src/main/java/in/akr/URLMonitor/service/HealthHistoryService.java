package in.akr.URLMonitor.service;

import in.akr.URLMonitor.dto.HealthRecordResponseDTO;
import in.akr.URLMonitor.dto.HealthStatsResponseDTO;

import java.util.List;
import java.util.Optional;

public interface HealthHistoryService {
    List<HealthRecordResponseDTO> getHealthHistory(Long urlId);
    Optional<HealthRecordResponseDTO> getLatestHealthStatus(Long urlId);
    HealthStatsResponseDTO getHealthStatistics(Long urlId);
}
