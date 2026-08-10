package in.akr.URLMonitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UrlMonitorApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrlMonitorApplication.class, args);
	}

}
