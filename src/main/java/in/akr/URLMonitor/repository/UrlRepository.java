package in.akr.URLMonitor.repository;

import in.akr.URLMonitor.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UrlRepository extends JpaRepository<Url,Long> {

}
