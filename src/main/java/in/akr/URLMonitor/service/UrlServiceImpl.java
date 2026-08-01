package in.akr.URLMonitor.service;

import in.akr.URLMonitor.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UrlServiceImpl implements UrlService{
    @Autowired
    private final UrlRepository urlRepository;

}
