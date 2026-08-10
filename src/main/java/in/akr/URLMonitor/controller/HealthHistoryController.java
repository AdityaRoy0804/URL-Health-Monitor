package in.akr.URLMonitor.controller;

import in.akr.URLMonitor.dto.HealthRecordResponseDTO;
import in.akr.URLMonitor.dto.HealthStatsResponseDTO;
import in.akr.URLMonitor.service.HealthHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class HealthHistoryController {
    private final HealthHistoryService healthHistoryService;

    @GetMapping("/{urlId}/health")
    public ResponseEntity<List<HealthRecordResponseDTO>> getHealthHistory(@PathVariable Long urlId){

        return ResponseEntity.ok(
                healthHistoryService.getHealthHistory(urlId)
        );
    }

    @GetMapping("/{urlId}/health/latest")
    public ResponseEntity<HealthRecordResponseDTO> getLatestHealthStatus(
            @PathVariable Long urlId) {

        return healthHistoryService
                .getLatestHealthStatus(urlId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{urlId}/health/stats")
    public ResponseEntity<HealthStatsResponseDTO> getHealthStatistics(
            @PathVariable Long urlId) {

        return ResponseEntity.ok(
                healthHistoryService.getHealthStatistics(urlId)
        );
    }
}
