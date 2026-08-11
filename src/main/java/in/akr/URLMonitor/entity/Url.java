package in.akr.URLMonitor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "urls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Url {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;
    @Column(nullable = false,unique = true,length = 500)
    private String url;
    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;
    @Column(name = "created_at",nullable = false)
    private LocalDateTime createdAt;
    @OneToMany(
            mappedBy = "url",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<HealthRecord> healthRecords = new ArrayList<>();

    @PrePersist
    public void onCreate(){
        this.createdAt = LocalDateTime.now();
    }

}
