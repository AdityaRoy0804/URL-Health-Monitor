package in.akr.URLMonitor.repository;

import in.akr.URLMonitor.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UrlRepository extends JpaRepository<Url,Long> {
    Optional<Url> findByUrl(String url);
}
