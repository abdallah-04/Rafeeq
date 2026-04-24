package com.rafeeq.backend.controller;

import com.rafeeq.backend.service.LearningTreeService;
import com.rafeeq.backend.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tree")
@RequiredArgsConstructor
public class LearningTreeController {

    private final OpenAiService openAiService;
    private final LearningTreeService learningTreeService;

    // TEST — نتأكد إن OpenAI شغال
    @GetMapping("/test")
    public String testAi() throws Exception {
        return openAiService.generateLearningTree(
            "أحمد", 5, "الأرقام ١-١٠", "Numbers 1-10", 1
        );
    }

    // GENERATE — تولد شجرة كاملة وتحفظها في DB
    @PostMapping("/generate/{childId}")
    public String generate(@PathVariable String childId) throws Exception {
        learningTreeService.generateTree(childId);
        return "✅ Tree generated successfully!";
    }

}