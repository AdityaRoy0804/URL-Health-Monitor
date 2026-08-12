package in.akr.URLMonitor.scheduler;

import in.akr.URLMonitor.service.HealthCheckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class HealthScheduler {
    private final HealthCheckService healthCheckService;

    @Scheduled(fixedRate = 60000)
    public void monitor(){
        log.info("Starting Health Check...");
        healthCheckService.checkAllUrls();
        log.info("Health Check Finished");
    }
}
