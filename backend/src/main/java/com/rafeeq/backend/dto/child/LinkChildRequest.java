package com.rafeeq.backend.dto.child;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LinkChildRequest {
    @NotBlank(message = "Child national ID is required")
    @Size(max = 100, message = "National ID is too long")
    private String nationalId;
}
