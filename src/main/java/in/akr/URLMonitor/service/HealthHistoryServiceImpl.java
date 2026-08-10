package in.akr.URLMonitor.service;

import in.akr.URLMonitor.dto.HealthRecordResponseDTO;
import in.akr.URLMonitor.dto.HealthStatsResponseDTO;
import in.akr.URLMonitor.dto.PageResponseDTO;
import in.akr.URLMonitor.entity.HealthRecord;
import in.akr.URLMonitor.entity.HealthStatus;
import in.akr.URLMonitor.exception.ResourceNotFoundException;
import in.akr.URLMonitor.mapper.HealthRecordMapper;
import in.akr.URLMonitor.repository.HealthRecordRepository;
import in.akr.URLMonitor.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HealthHistoryServiceImpl implements HealthHistoryService{

    private final HealthRecordRepository healthRecordRepository;
    private final UrlRepository urlRepository;
    private final HealthRecordMapper healthRecordMapper;

    @Override
    public PageResponseDTO<HealthRecordResponseDTO> getHealthHistory(
            Long urlId,
            int page,
            int size,
            HealthStatus status) {

        if (!urlRepository.existsById(urlId)) {
            throw new ResourceNotFoundException(
                    "URL not found with id: " + urlId
            );
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );

        Page<HealthRecord> healthRecords;

        if (status == null) {

            healthRecords =
                    healthRecordRepository
                            .findByUrlIdOrderByCheckedAtDesc(
                                    urlId,
                                    pageable
                            );

        } else {

            healthRecords =
                    healthRecordRepository
                            .findByUrlIdAndStatusOrderByCheckedAtDesc(
                                    urlId,
                                    status,
                                    pageable
                            );
        }

        List<HealthRecordResponseDTO> content =
                healthRecords
                        .getContent()
                        .stream()
                        .map(healthRecordMapper::toResponse)
                        .toList();

        return PageResponseDTO
                .<HealthRecordResponseDTO>builder()
                .content(content)
                .page(healthRecords.getNumber())
                .size(healthRecords.getSize())
                .totalElements(healthRecords.getTotalElements())
                .totalPages(healthRecords.getTotalPages())
                .first(healthRecords.isFirst())
                .last(healthRecords.isLast())
                .build();
    }

    @Override
    public Optional<HealthRecordResponseDTO> getLatestHealthStatus(Long urlId) {

        if (!urlRepository.existsById(urlId)) {
            throw new ResourceNotFoundException("URL not found with id: " + urlId);
        }

        return healthRecordRepository
                .findTopByUrlIdOrderByCheckedAtDesc(urlId)
                .map(healthRecordMapper::toResponse);
    }

    @Override
    public HealthStatsResponseDTO getHealthStatistics(Long urlId) {

        if (!urlRepository.existsById(urlId)) {
            throw new ResourceNotFoundException(
                    "URL not found with id: " + urlId
            );
        }

        long totalChecks =
                healthRecordRepository.countByUrlId(urlId);

        long successfulChecks =
                healthRecordRepository.countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.UP
                );

        long failedChecks =
                healthRecordRepository.countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.DOWN
                );

        double uptimePercentage = totalChecks == 0
                ? 0.0
                : ((double) successfulChecks / totalChecks) * 100;

        Double averageResponseTime =
                healthRecordRepository.findAverageResponseTime(urlId);

        Long minResponseTime =
                healthRecordRepository.findMinResponseTime(urlId);

        Long maxResponseTime =
                healthRecordRepository.findMaxResponseTime(urlId);

        return HealthStatsResponseDTO.builder()
                .totalChecks(totalChecks)
                .successfulChecks(successfulChecks)
                .failedChecks(failedChecks)
                .uptimePercentage(
                        Math.round(uptimePercentage * 100.0) / 100.0
                )
                .averageResponseTime(
                        averageResponseTime != null
                                ? Math.round(averageResponseTime * 100.0) / 100.0
                                : 0.0
                )
                .minResponseTime(minResponseTime)
                .maxResponseTime(maxResponseTime)
                .build();
    }
}
