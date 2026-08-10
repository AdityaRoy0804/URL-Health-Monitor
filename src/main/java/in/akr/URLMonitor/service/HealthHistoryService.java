package in.akr.URLMonitor.service;

import in.akr.URLMonitor.dto.HealthRecordResponseDTO;
import in.akr.URLMonitor.dto.HealthStatsResponseDTO;
import in.akr.URLMonitor.dto.PageResponseDTO;

import java.util.List;
import java.util.Optional;

public interface HealthHistoryService {
    PageResponseDTO<HealthRecordResponseDTO> getHealthHistory(Long urlId, int page,int size);
    Optional<HealthRecordResponseDTO> getLatestHealthStatus(Long urlId);
    HealthStatsResponseDTO getHealthStatistics(Long urlId);
}
