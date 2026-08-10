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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HealthHistoryServiceImplTest {

    @Mock
    private HealthRecordRepository healthRecordRepository;

    @Mock
    private UrlRepository urlRepository;

    @Mock
    private HealthRecordMapper healthRecordMapper;

    @InjectMocks
    private HealthHistoryServiceImpl healthHistoryService;


    // ==================================================
    // GET HEALTH HISTORY
    // ==================================================

    @Test
    void shouldReturnHealthHistorySuccessfully() {

        Long urlId = 1L;
        int page = 0;
        int size = 10;

        HealthRecord record1 = new HealthRecord();
        HealthRecord record2 = new HealthRecord();

        HealthRecordResponseDTO response1 =
                HealthRecordResponseDTO.builder().build();

        HealthRecordResponseDTO response2 =
                HealthRecordResponseDTO.builder().build();

        when(urlRepository.existsById(urlId))
                .thenReturn(true);

        PageImpl<HealthRecord> healthPage =
                new PageImpl<>(
                        List.of(record1, record2),
                        PageRequest.of(page, size),
                        2
                );

        when(
                healthRecordRepository
                        .findByUrlIdOrderByCheckedAtDesc(
                                eq(urlId),
                                any(Pageable.class)
                        )
        ).thenReturn(healthPage);

        when(healthRecordMapper.toResponse(record1))
                .thenReturn(response1);

        when(healthRecordMapper.toResponse(record2))
                .thenReturn(response2);

        PageResponseDTO<HealthRecordResponseDTO> result =
                healthHistoryService.getHealthHistory(
                        urlId,
                        page,
                        size,
                        null
                );

        assertNotNull(result);

        assertEquals(2, result.getContent().size());
        assertEquals(0, result.getPage());
        assertEquals(10, result.getSize());
        assertEquals(2, result.getTotalElements());
        assertEquals(1, result.getTotalPages());

        assertTrue(result.isFirst());
        assertTrue(result.isLast());

        assertEquals(response1, result.getContent().get(0));
        assertEquals(response2, result.getContent().get(1));

        verify(urlRepository)
                .existsById(urlId);

        verify(healthRecordRepository)
                .findByUrlIdOrderByCheckedAtDesc(
                        eq(urlId),
                        any(Pageable.class)
                );

        verify(healthRecordMapper)
                .toResponse(record1);

        verify(healthRecordMapper)
                .toResponse(record2);
    }


    @Test
    void shouldFilterHealthHistoryByStatus() {

        Long urlId = 1L;
        int page = 0;
        int size = 10;

        HealthRecord record = new HealthRecord();

        HealthRecordResponseDTO response =
                HealthRecordResponseDTO.builder().build();

        when(urlRepository.existsById(urlId))
                .thenReturn(true);

        PageImpl<HealthRecord> healthPage =
                new PageImpl<>(
                        List.of(record),
                        PageRequest.of(page, size),
                        1
                );

        when(
                healthRecordRepository
                        .findByUrlIdAndStatusOrderByCheckedAtDesc(
                                eq(urlId),
                                eq(HealthStatus.UP),
                                any(Pageable.class)
                        )
        ).thenReturn(healthPage);

        when(healthRecordMapper.toResponse(record))
                .thenReturn(response);

        PageResponseDTO<HealthRecordResponseDTO> result =
                healthHistoryService.getHealthHistory(
                        urlId,
                        page,
                        size,
                        HealthStatus.UP
                );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1, result.getTotalElements());

        verify(
                healthRecordRepository
        ).findByUrlIdAndStatusOrderByCheckedAtDesc(
                eq(urlId),
                eq(HealthStatus.UP),
                any(Pageable.class)
        );

        verify(
                healthRecordRepository,
                never()
        ).findByUrlIdOrderByCheckedAtDesc(
                anyLong(),
                any(Pageable.class)
        );
    }


    @Test
    void shouldThrowExceptionWhenUrlDoesNotExistForHistory() {

        Long urlId = 999L;

        when(urlRepository.existsById(urlId))
                .thenReturn(false);

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> healthHistoryService.getHealthHistory(
                                urlId,
                                0,
                                10,
                                null
                        )
                );

        assertEquals(
                "URL not found with id: 999",
                exception.getMessage()
        );

        verify(urlRepository)
                .existsById(urlId);

        verify(
                healthRecordRepository,
                never()
        ).findByUrlIdOrderByCheckedAtDesc(
                anyLong(),
                any(Pageable.class)
        );
    }


    @Test
    void shouldReturnEmptyHealthHistory() {

        Long urlId = 1L;

        when(urlRepository.existsById(urlId))
                .thenReturn(true);

        PageImpl<HealthRecord> emptyPage =
                new PageImpl<>(
                        List.of(),
                        PageRequest.of(0, 10),
                        0
                );

        when(
                healthRecordRepository
                        .findByUrlIdOrderByCheckedAtDesc(
                                eq(urlId),
                                any(Pageable.class)
                        )
        ).thenReturn(emptyPage);

        PageResponseDTO<HealthRecordResponseDTO> result =
                healthHistoryService.getHealthHistory(
                        urlId,
                        0,
                        10,
                        null
                );

        assertNotNull(result);
        assertTrue(result.getContent().isEmpty());

        assertEquals(0, result.getTotalElements());
        assertEquals(0, result.getTotalPages());

        verify(
                healthRecordRepository
        ).findByUrlIdOrderByCheckedAtDesc(
                anyLong(),
                any(Pageable.class)
        );
    }


    // ==================================================
    // LATEST HEALTH STATUS
    // ==================================================

    @Test
    void shouldReturnLatestHealthStatus() {

        Long urlId = 1L;

        HealthRecord record = new HealthRecord();

        HealthRecordResponseDTO response =
                HealthRecordResponseDTO.builder().build();

        when(urlRepository.existsById(urlId))
                .thenReturn(true);

        when(
                healthRecordRepository
                        .findTopByUrlIdOrderByCheckedAtDesc(urlId)
        ).thenReturn(Optional.of(record));

        when(healthRecordMapper.toResponse(record))
                .thenReturn(response);

        Optional<HealthRecordResponseDTO> result =
                healthHistoryService.getLatestHealthStatus(urlId);

        assertTrue(result.isPresent());
        assertEquals(response, result.get());

        verify(urlRepository)
                .existsById(urlId);

        verify(healthRecordRepository)
                .findTopByUrlIdOrderByCheckedAtDesc(urlId);

        verify(healthRecordMapper)
                .toResponse(record);
    }


    @Test
    void shouldReturnEmptyWhenNoLatestHealthStatusExists() {

        Long urlId = 1L;

        when(urlRepository.existsById(urlId))
                .thenReturn(true);

        when(
                healthRecordRepository
                        .findTopByUrlIdOrderByCheckedAtDesc(urlId)
        ).thenReturn(Optional.empty());

        Optional<HealthRecordResponseDTO> result =
                healthHistoryService.getLatestHealthStatus(urlId);

        assertTrue(result.isEmpty());

        verify(urlRepository)
                .existsById(urlId);

        verify(healthRecordRepository)
                .findTopByUrlIdOrderByCheckedAtDesc(urlId);

        verify(healthRecordMapper, never())
                .toResponse(any());
    }


    @Test
    void shouldThrowExceptionWhenGettingLatestStatusForUnknownUrl() {

        Long urlId = 999L;

        when(urlRepository.existsById(urlId))
                .thenReturn(false);

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> healthHistoryService.getLatestHealthStatus(urlId)
                );

        assertEquals(
                "URL not found with id: 999",
                exception.getMessage()
        );

        verify(
                healthRecordRepository,
                never()
        ).findTopByUrlIdOrderByCheckedAtDesc(anyLong());
    }


    // ==================================================
    // HEALTH STATISTICS
    // ==================================================

    @Test
    void shouldCalculateHealthStatisticsSuccessfully() {

        Long urlId = 1L;

        when(urlRepository.existsById(urlId))
                .thenReturn(true);

        when(
                healthRecordRepository.countByUrlId(urlId)
        ).thenReturn(10L);

        when(
                healthRecordRepository.countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.UP
                )
        ).thenReturn(8L);

        when(
                healthRecordRepository.countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.DOWN
                )
        ).thenReturn(2L);

        when(
                healthRecordRepository.findAverageResponseTime(urlId)
        ).thenReturn(250.567);

        when(
                healthRecordRepository.findMinResponseTime(urlId)
        ).thenReturn(120L);

        when(
                healthRecordRepository.findMaxResponseTime(urlId)
        ).thenReturn(600L);

        HealthStatsResponseDTO result =
                healthHistoryService.getHealthStatistics(urlId);

        assertNotNull(result);

        assertEquals(10L, result.getTotalChecks());
        assertEquals(8L, result.getSuccessfulChecks());
        assertEquals(2L, result.getFailedChecks());

        assertEquals(
                80.0,
                result.getUptimePercentage()
        );

        assertEquals(
                250.57,
                result.getAverageResponseTime()
        );

        assertEquals(
                120L,
                result.getMinResponseTime()
        );

        assertEquals(
                600L,
                result.getMaxResponseTime()
        );

        verify(urlRepository)
                .existsById(urlId);

        verify(healthRecordRepository)
                .countByUrlId(urlId);

        verify(healthRecordRepository)
                .countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.UP
                );

        verify(healthRecordRepository)
                .countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.DOWN
                );

        verify(healthRecordRepository)
                .findAverageResponseTime(urlId);

        verify(healthRecordRepository)
                .findMinResponseTime(urlId);

        verify(healthRecordRepository)
                .findMaxResponseTime(urlId);
    }


    @Test
    void shouldReturnZeroStatisticsWhenNoHealthRecordsExist() {

        Long urlId = 1L;

        when(urlRepository.existsById(urlId))
                .thenReturn(true);

        when(
                healthRecordRepository.countByUrlId(urlId)
        ).thenReturn(0L);

        when(
                healthRecordRepository.countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.UP
                )
        ).thenReturn(0L);

        when(
                healthRecordRepository.countByUrlIdAndStatus(
                        urlId,
                        HealthStatus.DOWN
                )
        ).thenReturn(0L);

        when(
                healthRecordRepository.findAverageResponseTime(urlId)
        ).thenReturn(null);

        when(
                healthRecordRepository.findMinResponseTime(urlId)
        ).thenReturn(null);

        when(
                healthRecordRepository.findMaxResponseTime(urlId)
        ).thenReturn(null);

        HealthStatsResponseDTO result =
                healthHistoryService.getHealthStatistics(urlId);

        assertNotNull(result);

        assertEquals(0L, result.getTotalChecks());
        assertEquals(0L, result.getSuccessfulChecks());
        assertEquals(0L, result.getFailedChecks());

        assertEquals(
                0.0,
                result.getUptimePercentage()
        );

        assertEquals(
                0.0,
                result.getAverageResponseTime()
        );

        assertNull(result.getMinResponseTime());
        assertNull(result.getMaxResponseTime());
    }


    @Test
    void shouldThrowExceptionWhenGettingStatisticsForUnknownUrl() {

        Long urlId = 999L;

        when(urlRepository.existsById(urlId))
                .thenReturn(false);

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> healthHistoryService.getHealthStatistics(urlId)
                );

        assertEquals(
                "URL not found with id: 999",
                exception.getMessage()
        );

        verify(
                healthRecordRepository,
                never()
        ).countByUrlId(anyLong());
    }
}

