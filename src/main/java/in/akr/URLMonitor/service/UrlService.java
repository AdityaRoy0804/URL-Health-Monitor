package in.akr.URLMonitor.service;

import in.akr.URLMonitor.dto.UrlRequestDTO;
import in.akr.URLMonitor.dto.UrlResponseDTO;

public interface UrlService {
    public UrlResponseDTO createUrl(UrlRequestDTO request);
}
