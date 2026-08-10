package in.akr.URLMonitor.controller;

import in.akr.URLMonitor.dto.HealthRecordResponseDTO;
import in.akr.URLMonitor.dto.HealthStatsResponseDTO;
import in.akr.URLMonitor.dto.PageResponseDTO;
import in.akr.URLMonitor.entity.HealthStatus;
import in.akr.URLMonitor.service.HealthHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class HealthHistoryController {
    private final HealthHistoryService healthHistoryService;

    @GetMapping("/{urlId}/health")
    public ResponseEntity<PageResponseDTO<HealthRecordResponseDTO>>
    getHealthHistory(
            @PathVariable Long urlId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) HealthStatus status) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100"
            );
        }

        return ResponseEntity.ok(
                healthHistoryService.getHealthHistory(
                        urlId,
                        page,
                        size,
                        status
                )
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
