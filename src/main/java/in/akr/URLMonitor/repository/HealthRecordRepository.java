package in.akr.URLMonitor.repository;

import in.akr.URLMonitor.entity.HealthRecord;
import in.akr.URLMonitor.entity.HealthStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HealthRecordRepository extends JpaRepository<HealthRecord,Long> {
    Page<HealthRecord> findByUrlIdOrderByCheckedAtDesc(Long urlId, Pageable pageable);

    Page<HealthRecord> findByUrlIdAndStatusOrderByCheckedAtDesc(
            Long urlId,
            HealthStatus status,
            Pageable pageable
    );

    Optional<HealthRecord> findTopByUrlIdOrderByCheckedAtDesc(Long urlId);

    long countByUrlId(Long urlId);

    long countByUrlIdAndStatus(Long urlId, HealthStatus status);

    @Query("""
        SELECT AVG(h.responseTime)
        FROM HealthRecord h
        WHERE h.url.id = :urlId
        """)
    Double findAverageResponseTime(@Param("urlId") Long urlId);

    @Query("""
        SELECT MIN(h.responseTime)
        FROM HealthRecord h
        WHERE h.url.id = :urlId
        """)
    Long findMinResponseTime(@Param("urlId") Long urlId);

    @Query("""
        SELECT MAX(h.responseTime)
        FROM HealthRecord h
        WHERE h.url.id = :urlId
        """)
    Long findMaxResponseTime(@Param("urlId") Long urlId);
}
