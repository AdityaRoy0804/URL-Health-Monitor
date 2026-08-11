package in.akr.URLMonitor.service;

import in.akr.URLMonitor.entity.HealthRecord;
import in.akr.URLMonitor.entity.HealthStatus;
import in.akr.URLMonitor.entity.Url;
import in.akr.URLMonitor.repository.HealthRecordRepository;
import in.akr.URLMonitor.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthCheckServiceImpl implements HealthCheckService{

    private final UrlRepository urlRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final RestClient restClient;


    @Override
    public void checkAllUrls() {
        List<Url> urls = urlRepository.findByEnabledTrue();

        log.info("Found {} enabled URLs to check",urls.size());

        for(Url url : urls){
            checkUrl(url);
        }
    }

    private void checkUrl(Url url) {

        log.info("Checking URL: {}", url.getUrl());

        long startTime = System.nanoTime();

        try {

            var response = restClient
                    .get()
                    .uri(url.getUrl())
                    .exchange((request, clientResponse) -> clientResponse);

            long responseTime =
                    (System.nanoTime() - startTime) / 1_000_000;

            int statusCode = response.getStatusCode().value();

            HealthStatus healthStatus =
                    statusCode >= 200 && statusCode < 400
                            ? HealthStatus.UP
                            : HealthStatus.DOWN;

            HealthRecord record = HealthRecord.builder()
                    .url(url)
                    .status(healthStatus)
                    .statusCode(statusCode)
                    .responseTime(responseTime)
                    .build();

            healthRecordRepository.save(record);

            log.info(
                    "URL: {} | Status: {} | HTTP: {} | Response Time: {} ms",
                    url.getUrl(),
                    healthStatus,
                    statusCode,
                    responseTime
            );

        } catch (Exception e) {

            long responseTime =
                    (System.nanoTime() - startTime) / 1_000_000;

            HealthRecord record = HealthRecord.builder()
                    .url(url)
                    .status(HealthStatus.DOWN)
                    .statusCode(null)
                    .responseTime(responseTime)
                    .errorMessage(e.getMessage())
                    .build();

            healthRecordRepository.save(record);

            log.error(
                    "URL: {} | DOWN | Network Error | Response Time: {} ms | Error: {}",
                    url.getUrl(),
                    responseTime,
                    e.getMessage()
            );
        }
    }
}
