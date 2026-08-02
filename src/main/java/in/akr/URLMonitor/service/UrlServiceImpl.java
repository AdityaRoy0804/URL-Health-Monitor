package in.akr.URLMonitor.service;

import in.akr.URLMonitor.dto.UrlRequestDTO;
import in.akr.URLMonitor.dto.UrlResponseDTO;
import in.akr.URLMonitor.entity.Url;
import in.akr.URLMonitor.mapper.UrlMapper;
import in.akr.URLMonitor.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UrlServiceImpl implements UrlService{
    @Autowired
    private final UrlRepository urlRepository;

    @Autowired
    private final UrlMapper urlMapper;

    @Override
    public UrlResponseDTO createUrl(UrlRequestDTO request) {
        if(urlRepository.findByUrl(request.getUrl()).isPresent()){
            throw new IllegalArgumentException("URL already exists.");
        }

        Url url = urlMapper.toEntity(request);
        urlRepository.save(url);

        return urlMapper.toResponse(url);
    }
}
