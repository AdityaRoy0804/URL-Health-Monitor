package in.akr.URLMonitor.mapper;

import in.akr.URLMonitor.dto.HealthRecordResponseDTO;
import in.akr.URLMonitor.entity.HealthRecord;
import org.springframework.stereotype.Component;

@Component
public class HealthRecordMapper {
    public HealthRecordResponseDTO toResponse(HealthRecord entity){
        return HealthRecordResponseDTO.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .statusCode(entity.getStatusCode())
                .responseTime(entity.getResponseTime())
                .errorMessage(entity.getErrorMessage())
                .checkedAt(entity.getCheckedAt())
                .build();
    }
}
