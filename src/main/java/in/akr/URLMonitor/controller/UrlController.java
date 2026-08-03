package in.akr.URLMonitor.controller;

import in.akr.URLMonitor.dto.UrlRequestDTO;
import in.akr.URLMonitor.dto.UrlResponseDTO;
import in.akr.URLMonitor.service.UrlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Returns the active operating status of the monitor API")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "code", "200",
                "status", "Url Monitor Api Running"
        ));
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new URL", description = "Validates and tracks a new destination URL.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "URL successfully registered"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or URL already exists")
    })
    public UrlResponseDTO create(@Valid @RequestBody UrlRequestDTO dto){
        return urlService.createUrl(dto);
    }

    @GetMapping("/view")
    public List<UrlResponseDTO> getAll(){
        return urlService.getAllUrls();
    }

    @GetMapping("/view/{id}")
    public UrlResponseDTO getById(@PathVariable Long id){
        return urlService.getUrl(id);
    }

    @PutMapping("/edit/{id}")
    public UrlResponseDTO update(@PathVariable Long id,@Valid @RequestBody UrlRequestDTO dto){
        return urlService.updateUrl(id,dto);
    }
}
