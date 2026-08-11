package in.akr.URLMonitor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.akr.URLMonitor.dto.HealthRecordResponseDTO;
import in.akr.URLMonitor.dto.HealthStatsResponseDTO;
import in.akr.URLMonitor.dto.PageResponseDTO;
import in.akr.URLMonitor.entity.HealthStatus;
import in.akr.URLMonitor.service.HealthHistoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthHistoryController.class)
class HealthHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HealthHistoryService healthHistoryService;


    // ==================================================
    // GET HEALTH HISTORY
    // ==================================================

    @Test
    void shouldReturnHealthHistory() throws Exception {

        HealthRecordResponseDTO record =
                HealthRecordResponseDTO.builder()
                        .build();

        PageResponseDTO<HealthRecordResponseDTO> response =
                PageResponseDTO.<HealthRecordResponseDTO>builder()
                        .content(List.of(record))
                        .page(0)
                        .size(10)
                        .totalElements(1)
                        .totalPages(1)
                        .first(true)
                        .last(true)
                        .build();

        when(
                healthHistoryService.getHealthHistory(
                        1L,
                        0,
                        10,
                        null
                )
        ).thenReturn(response);

        mockMvc.perform(
                        get("/api/urls/1/health")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true));

        verify(healthHistoryService)
                .getHealthHistory(
                        1L,
                        0,
                        10,
                        null
                );
    }


    // ==================================================
    // PAGINATION
    // ==================================================

    @Test
    void shouldAcceptPaginationParameters() throws Exception {

        PageResponseDTO<HealthRecordResponseDTO> response =
                PageResponseDTO.<HealthRecordResponseDTO>builder()
                        .content(List.of())
                        .page(2)
                        .size(5)
                        .totalElements(15)
                        .totalPages(3)
                        .first(false)
                        .last(true)
                        .build();

        when(
                healthHistoryService.getHealthHistory(
                        1L,
                        2,
                        5,
                        null
                )
        ).thenReturn(response);

        mockMvc.perform(
                        get("/api/urls/1/health")
                                .param("page", "2")
                                .param("size", "5")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalElements").value(15))
                .andExpect(jsonPath("$.totalPages").value(3));

        verify(healthHistoryService)
                .getHealthHistory(
                        1L,
                        2,
                        5,
                        null
                );
    }


    // ==================================================
    // STATUS FILTER
    // ==================================================

    @Test
    void shouldFilterHealthHistoryByStatus() throws Exception {

        PageResponseDTO<HealthRecordResponseDTO> response =
                PageResponseDTO.<HealthRecordResponseDTO>builder()
                        .content(List.of())
                        .page(0)
                        .size(10)
                        .totalElements(5)
                        .totalPages(1)
                        .first(true)
                        .last(true)
                        .build();

        when(
                healthHistoryService.getHealthHistory(
                        1L,
                        0,
                        10,
                        HealthStatus.UP
                )
        ).thenReturn(response);

        mockMvc.perform(
                        get("/api/urls/1/health")
                                .param("status", "UP")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(5));

        verify(healthHistoryService)
                .getHealthHistory(
                        1L,
                        0,
                        10,
                        HealthStatus.UP
                );
    }


    // ==================================================
    // INVALID PAGE
    // ==================================================

    @Test
    void shouldRejectNegativePage() throws Exception {

        mockMvc.perform(
                        get("/api/urls/1/health")
                                .param("page", "-1")
                )
                .andExpect(status().isBadRequest());

        verify(
                healthHistoryService,
                never()
        ).getHealthHistory(
                anyLong(),
                anyInt(),
                anyInt(),
                any()
        );
    }


    // ==================================================
    // INVALID PAGE SIZE
    // ==================================================

    @Test
    void shouldRejectZeroPageSize() throws Exception {

        mockMvc.perform(
                        get("/api/urls/1/health")
                                .param("size", "0")
                )
                .andExpect(status().isBadRequest());

        verify(
                healthHistoryService,
                never()
        ).getHealthHistory(
                anyLong(),
                anyInt(),
                anyInt(),
                any()
        );
    }


    @Test
    void shouldRejectPageSizeGreaterThan100() throws Exception {

        mockMvc.perform(
                        get("/api/urls/1/health")
                                .param("size", "101")
                )
                .andExpect(status().isBadRequest());

        verify(
                healthHistoryService,
                never()
        ).getHealthHistory(
                anyLong(),
                anyInt(),
                anyInt(),
                any()
        );
    }


    // ==================================================
    // LATEST HEALTH STATUS
    // ==================================================

    @Test
    void shouldReturnLatestHealthStatus() throws Exception {

        HealthRecordResponseDTO response =
                HealthRecordResponseDTO.builder()
                        .build();

        when(
                healthHistoryService
                        .getLatestHealthStatus(1L)
        ).thenReturn(Optional.of(response));

        mockMvc.perform(
                        get("/api/urls/1/health/latest")
                )
                .andExpect(status().isOk());

        verify(healthHistoryService)
                .getLatestHealthStatus(1L);
    }


    @Test
    void shouldReturnNoContentWhenLatestStatusDoesNotExist()
            throws Exception {

        when(
                healthHistoryService
                        .getLatestHealthStatus(1L)
        ).thenReturn(Optional.empty());

        mockMvc.perform(
                        get("/api/urls/1/health/latest")
                )
                .andExpect(status().isNoContent());

        verify(healthHistoryService)
                .getLatestHealthStatus(1L);
    }


    // ==================================================
    // HEALTH STATISTICS
    // ==================================================

    @Test
    void shouldReturnHealthStatistics() throws Exception {

        HealthStatsResponseDTO response =
                HealthStatsResponseDTO.builder()
                        .totalChecks(10L)
                        .successfulChecks(8L)
                        .failedChecks(2L)
                        .uptimePercentage(80.0)
                        .averageResponseTime(250.50)
                        .minResponseTime(100L)
                        .maxResponseTime(500L)
                        .build();

        when(
                healthHistoryService
                        .getHealthStatistics(1L)
        ).thenReturn(response);

        mockMvc.perform(
                        get("/api/urls/1/health/stats")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalChecks").value(10))
                .andExpect(jsonPath("$.successfulChecks").value(8))
                .andExpect(jsonPath("$.failedChecks").value(2))
                .andExpect(jsonPath("$.uptimePercentage").value(80.0))
                .andExpect(jsonPath("$.averageResponseTime").value(250.50))
                .andExpect(jsonPath("$.minResponseTime").value(100))
                .andExpect(jsonPath("$.maxResponseTime").value(500));

        verify(healthHistoryService)
                .getHealthStatistics(1L);
    }
}

