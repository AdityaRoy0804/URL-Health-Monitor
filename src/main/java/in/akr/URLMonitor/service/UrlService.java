package in.akr.URLMonitor.service;

import in.akr.URLMonitor.dto.UrlRequestDTO;
import in.akr.URLMonitor.dto.UrlResponseDTO;

import java.util.List;

public interface UrlService {
    public UrlResponseDTO createUrl(UrlRequestDTO request);

    List<UrlResponseDTO> getAllUrls();

    UrlResponseDTO getUrl(Long id);

    UrlResponseDTO updateUrl(Long id, UrlRequestDTO request);
}
