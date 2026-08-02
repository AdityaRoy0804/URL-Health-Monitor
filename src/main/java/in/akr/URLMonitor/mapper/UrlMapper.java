package in.akr.URLMonitor.mapper;

import in.akr.URLMonitor.dto.UrlRequestDTO;
import in.akr.URLMonitor.dto.UrlResponseDTO;
import in.akr.URLMonitor.entity.Url;
import org.springframework.stereotype.Component;

@Component
public class UrlMapper {
    // DTO - Entity
    public Url toEntity(UrlRequestDTO dto){
        return Url.builder()
                .name(dto.getName())
                .url(dto.getUrl())
                .enabled(dto.getEnabled())
                .build();
    }

    // Entity - DTO
    public UrlResponseDTO toResponse(Url entity){
        return UrlResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .url(entity.getUrl())
                .enabled(entity.getEnabled())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    // Update existing Entity using DTO
    public void updateEntity(UrlRequestDTO dto, Url entity){
        entity.setName(dto.getName());
        entity.setUrl(dto.getUrl());
        entity.setEnabled(dto.getEnabled());
    }
}
