package in.akr.URLMonitor.service;

import in.akr.URLMonitor.dto.UrlRequestDTO;
import in.akr.URLMonitor.dto.UrlResponseDTO;
import in.akr.URLMonitor.entity.Url;
import in.akr.URLMonitor.exception.ResourceNotFoundException;
import in.akr.URLMonitor.mapper.UrlMapper;
import in.akr.URLMonitor.repository.UrlRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UrlServiceImplTest {

    @Mock
    private UrlRepository urlRepository;

    @Mock
    private UrlMapper urlMapper;

    @InjectMocks
    private UrlServiceImpl urlService;


    // --------------------------------------------------
    // CREATE URL
    // --------------------------------------------------

    @Test
    void shouldCreateUrlSuccessfully() {

        UrlRequestDTO request = new UrlRequestDTO();

        request.setName("Google");
        request.setUrl("https://www.google.com");
        request.setEnabled(true);

        Url url = new Url();

        UrlResponseDTO response = UrlResponseDTO.builder()
                .id(1L)
                .name("Google")
                .url("https://www.google.com")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(urlRepository.findByUrl(request.getUrl()))
                .thenReturn(Optional.empty());

        when(urlMapper.toEntity(request))
                .thenReturn(url);

        when(urlRepository.save(url))
                .thenReturn(url);

        when(urlMapper.toResponse(url))
                .thenReturn(response);

        UrlResponseDTO result =
                urlService.createUrl(request);

        assertNotNull(result);
        assertEquals(response, result);

        verify(urlRepository)
                .findByUrl(request.getUrl());

        verify(urlMapper)
                .toEntity(request);

        verify(urlRepository)
                .save(url);

        verify(urlMapper)
                .toResponse(url);
    }


    @Test
    void shouldThrowExceptionWhenUrlAlreadyExists() {

        UrlRequestDTO request = new UrlRequestDTO();

        request.setName("Google");
        request.setUrl("https://www.google.com");
        request.setEnabled(true);

        Url existingUrl = new Url();

        when(urlRepository.findByUrl(request.getUrl()))
                .thenReturn(Optional.of(existingUrl));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> urlService.createUrl(request)
                );

        assertEquals(
                "URL already exists.",
                exception.getMessage()
        );

        verify(urlRepository)
                .findByUrl(request.getUrl());

        verify(urlMapper, never())
                .toEntity(any());

        verify(urlRepository, never())
                .save(any());
    }


    // --------------------------------------------------
    // GET ALL URLS
    // --------------------------------------------------

    @Test
    void shouldReturnAllUrls() {

        Url url1 = new Url();
        Url url2 = new Url();

        UrlResponseDTO response1 = UrlResponseDTO.builder()
                .id(1L)
                .name("Google")
                .url("https://www.google.com")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        UrlResponseDTO response2 = UrlResponseDTO.builder()
                .id(2L)
                .name("GitHub")
                .url("https://github.com")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(urlRepository.findAll())
                .thenReturn(List.of(url1, url2));

        when(urlMapper.toResponse(url1))
                .thenReturn(response1);

        when(urlMapper.toResponse(url2))
                .thenReturn(response2);

        List<UrlResponseDTO> result =
                urlService.getAllUrls();

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals(response1, result.get(0));
        assertEquals(response2, result.get(1));

        verify(urlRepository)
                .findAll();

        verify(urlMapper)
                .toResponse(url1);

        verify(urlMapper)
                .toResponse(url2);
    }


    // --------------------------------------------------
    // GET URL BY ID
    // --------------------------------------------------

    @Test
    void shouldReturnUrlById() {

        Long id = 1L;

        Url url = new Url();

        UrlResponseDTO response = UrlResponseDTO.builder()
                .id(1L)
                .name("Google")
                .url("https://www.google.com")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(urlRepository.findById(id))
                .thenReturn(Optional.of(url));

        when(urlMapper.toResponse(url))
                .thenReturn(response);

        UrlResponseDTO result =
                urlService.getUrl(id);

        assertNotNull(result);
        assertEquals(response, result);

        verify(urlRepository)
                .findById(id);

        verify(urlMapper)
                .toResponse(url);
    }


    @Test
    void shouldThrowExceptionWhenUrlDoesNotExist() {

        Long id = 999L;

        when(urlRepository.findById(id))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> urlService.getUrl(id)
                );

        assertEquals(
                "URL not found",
                exception.getMessage()
        );

        verify(urlRepository)
                .findById(id);

        verify(urlMapper, never())
                .toResponse(any());
    }


    // --------------------------------------------------
    // UPDATE URL
    // --------------------------------------------------

    @Test
    void shouldUpdateUrlSuccessfully() {

        Long id = 1L;

        UrlRequestDTO request =
                new UrlRequestDTO();

        request.setName("Updated Google");
        request.setUrl("https://google.com");
        request.setEnabled(false);

        Url existingUrl = new Url();

        UrlResponseDTO response = UrlResponseDTO.builder()
                .id(1L)
                .name("Updated Google")
                .url("https://google.com")
                .enabled(false)
                .createdAt(LocalDateTime.now())
                .build();

        when(urlRepository.findById(id))
                .thenReturn(Optional.of(existingUrl));

        when(urlRepository.save(existingUrl))
                .thenReturn(existingUrl);

        when(urlMapper.toResponse(existingUrl))
                .thenReturn(response);

        UrlResponseDTO result =
                urlService.updateUrl(id, request);

        assertNotNull(result);
        assertEquals(response, result);

        assertEquals(
                "Updated Google",
                existingUrl.getName()
        );

        assertEquals(
                "https://google.com",
                existingUrl.getUrl()
        );

        assertFalse(
                existingUrl.getEnabled()
        );

        verify(urlRepository)
                .findById(id);

        verify(urlRepository)
                .save(existingUrl);

        verify(urlMapper)
                .toResponse(existingUrl);
    }


    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingUrl() {

        Long id = 999L;

        UrlRequestDTO request =
                new UrlRequestDTO();

        request.setName("Google");
        request.setUrl("https://google.com");
        request.setEnabled(true);

        when(urlRepository.findById(id))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> urlService.updateUrl(id, request)
                );

        assertEquals(
                "URL not found",
                exception.getMessage()
        );

        verify(urlRepository)
                .findById(id);

        verify(urlRepository, never())
                .save(any());
    }


    // --------------------------------------------------
    // DELETE URL
    // --------------------------------------------------

    @Test
    void shouldDeleteUrlSuccessfully() {

        Long id = 1L;

        Url url = new Url();

        when(urlRepository.findById(id))
                .thenReturn(Optional.of(url));

        urlService.deleteUrl(id);

        verify(urlRepository)
                .findById(id);

        verify(urlRepository)
                .delete(url);
    }


    @Test
    void shouldThrowExceptionWhenDeletingNonExistingUrl() {

        Long id = 999L;

        when(urlRepository.findById(id))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> urlService.deleteUrl(id)
                );

        assertEquals(
                "URL not found",
                exception.getMessage()
        );

        verify(urlRepository)
                .findById(id);

        verify(urlRepository, never())
                .delete(any());
    }
}

