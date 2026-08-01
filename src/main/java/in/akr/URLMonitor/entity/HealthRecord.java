package in.akr.URLMonitor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HealthStatus status;
    @Column(name = "status_code")
    private Integer statusCode;
    @Column(name = "response_time")
    private Long responseTime;
    @Column(name = "error_message",length = 1000)
    private String errorMessage;
    @Column(name = "checked_at",nullable = false)
    private LocalDateTime checkedAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id",nullable = false)
    private Url url;

    @PrePersist
    public void onCreate(){
        this.checkedAt = LocalDateTime.now();
    }
}
