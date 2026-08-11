package in.akr.URLMonitor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UrlResponseDTO {
    private Long id;
    private String name;
    private String url;
    private Boolean enabled;
    private LocalDateTime createdAt;
}
