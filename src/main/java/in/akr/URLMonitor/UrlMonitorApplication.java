package in.akr.URLMonitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UrlMonitorApplication {

	public static void main(String[] args) {
		System.out.println("MYSQL_USER = " + System.getenv("MYSQL_USER"));
		System.out.println("MYSQL_PASSWORD_SET = " +
				(System.getenv("MYSQL_PASSWORD") != null));
		SpringApplication.run(UrlMonitorApplication.class, args);
	}
}
