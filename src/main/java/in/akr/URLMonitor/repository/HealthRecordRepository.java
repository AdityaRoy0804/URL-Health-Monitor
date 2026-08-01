package in.akr.URLMonitor.repository;

import in.akr.URLMonitor.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthRecordRepository extends JpaRepository<HealthRecord,Long> {

}
