package in.akr.URLMonitor.controller;

import in.akr.URLMonitor.dto.UrlRequestDTO;
import in.akr.URLMonitor.dto.UrlResponseDTO;
import in.akr.URLMonitor.service.UrlService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UrlController.class)
class UrlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UrlService urlService;


    // ==================================================
    // HEALTH ENDPOINT
    // ==================================================

    @Test
    void shouldReturnApiHealth() throws Exception {

        mockMvc.perform(
                        get("/api/urls/health")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(
                        jsonPath("$.status")
                                .value("Url Monitor Api Running")
                );
    }


    // ==================================================
    // CREATE URL
    // ==================================================

    @Test
    void shouldCreateUrlSuccessfully() throws Exception {

        UrlResponseDTO response =
                UrlResponseDTO.builder()
                        .id(1L)
                        .name("Google")
                        .url("https://www.google.com")
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .build();

        when(urlService.createUrl(any(UrlRequestDTO.class)))
                .thenReturn(response);

        String requestJson = """
                {
                    "name": "Google",
                    "url": "https://www.google.com",
                    "enabled": true
                }
                """;

        mockMvc.perform(
                        post("/api/urls/new")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Google"))
                .andExpect(
                        jsonPath("$.url")
                                .value("https://www.google.com")
                )
                .andExpect(jsonPath("$.enabled").value(true));

        verify(urlService)
                .createUrl(any(UrlRequestDTO.class));
    }


    // ==================================================
    // CREATE URL - VALIDATION
    // ==================================================

    @Test
    void shouldRejectInvalidCreateRequest() throws Exception {

        String requestJson = """
                {
                    "name": "",
                    "url": "",
                    "enabled": null
                }
                """;

        mockMvc.perform(
                        post("/api/urls/new")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isBadRequest());

        verify(
                urlService,
                never()
        ).createUrl(any());
    }


    // ==================================================
    // GET ALL URLS
    // ==================================================

    @Test
    void shouldReturnAllUrls() throws Exception {

        UrlResponseDTO response1 =
                UrlResponseDTO.builder()
                        .id(1L)
                        .name("Google")
                        .url("https://www.google.com")
                        .enabled(true)
                        .build();

        UrlResponseDTO response2 =
                UrlResponseDTO.builder()
                        .id(2L)
                        .name("GitHub")
                        .url("https://github.com")
                        .enabled(true)
                        .build();

        when(urlService.getAllUrls())
                .thenReturn(List.of(response1, response2));

        mockMvc.perform(
                        get("/api/urls/view")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Google"))
                .andExpect(jsonPath("$[1].name").value("GitHub"));

        verify(urlService)
                .getAllUrls();
    }


    // ==================================================
    // GET URL BY ID
    // ==================================================

    @Test
    void shouldReturnUrlById() throws Exception {

        UrlResponseDTO response =
                UrlResponseDTO.builder()
                        .id(1L)
                        .name("Google")
                        .url("https://www.google.com")
                        .enabled(true)
                        .build();

        when(urlService.getUrl(1L))
                .thenReturn(response);

        mockMvc.perform(
                        get("/api/urls/view/1")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Google"))
                .andExpect(
                        jsonPath("$.url")
                                .value("https://www.google.com")
                );

        verify(urlService)
                .getUrl(1L);
    }


    // ==================================================
    // UPDATE URL
    // ==================================================

    @Test
    void shouldUpdateUrlSuccessfully() throws Exception {

        UrlResponseDTO response =
                UrlResponseDTO.builder()
                        .id(1L)
                        .name("Updated Google")
                        .url("https://google.com")
                        .enabled(false)
                        .build();

        when(
                urlService.updateUrl(
                        eq(1L),
                        any(UrlRequestDTO.class)
                )
        ).thenReturn(response);

        String requestJson = """
                {
                    "name": "Updated Google",
                    "url": "https://google.com",
                    "enabled": false
                }
                """;

        mockMvc.perform(
                        put("/api/urls/edit/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(
                        jsonPath("$.name")
                                .value("Updated Google")
                )
                .andExpect(
                        jsonPath("$.enabled")
                                .value(false)
                );

        verify(urlService)
                .updateUrl(
                        eq(1L),
                        any(UrlRequestDTO.class)
                );
    }


    // ==================================================
    // UPDATE URL - VALIDATION
    // ==================================================

    @Test
    void shouldRejectInvalidUpdateRequest() throws Exception {

        String requestJson = """
                {
                    "name": "",
                    "url": "",
                    "enabled": null
                }
                """;

        mockMvc.perform(
                        put("/api/urls/edit/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestJson)
                )
                .andExpect(status().isBadRequest());

        verify(
                urlService,
                never()
        ).updateUrl(
                anyLong(),
                any(UrlRequestDTO.class)
        );
    }


    // ==================================================
    // DELETE URL
    // ==================================================

    @Test
    void shouldDeleteUrlSuccessfully() throws Exception {

        doNothing()
                .when(urlService)
                .deleteUrl(1L);

        mockMvc.perform(
                        delete("/api/urls/delete/1")
                )
                .andExpect(status().isNoContent());

        verify(urlService)
                .deleteUrl(1L);
    }
}
