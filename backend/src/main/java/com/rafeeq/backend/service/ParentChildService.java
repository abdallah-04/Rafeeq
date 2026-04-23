package com.rafeeq.backend.service;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.child.ChildResponse;
import com.rafeeq.backend.dto.child.ChildSummaryResponse;
import com.rafeeq.backend.dto.child.LinkChildRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParentChildService {

    private final ChildService childService;

    public List<ChildResponse> getAll(String nationalId) {
        return childService.getMyChildren(nationalId);
    }

    public ChildResponse getOne(UUID id, String nationalId) {
        return childService.getChildById(id, nationalId);
    }

    public ChildSummaryResponse getSummary(UUID id, String nationalId) {
        return childService.getChildSummary(id, nationalId);
    }

    public MessageResponse link(LinkChildRequest request, String nationalId) {
        return childService.linkChildByNationalId(request, nationalId);
    }

    public MessageResponse unlink(UUID id, String nationalId) {
        return childService.deleteChild(id, nationalId);
    }
}
