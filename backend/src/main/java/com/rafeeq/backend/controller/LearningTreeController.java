package com.rafeeq.backend.controller;

import com.rafeeq.backend.entity.LearningTree;
import com.rafeeq.backend.entity.TreeItem;
import com.rafeeq.backend.repository.LearningTreeRepository;
import com.rafeeq.backend.repository.TreeItemRepository;
import com.rafeeq.backend.service.LearningTreeService;
import com.rafeeq.backend.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tree")
@RequiredArgsConstructor
public class LearningTreeController {

    private final OpenAiService openAiService;
    private final LearningTreeService learningTreeService;
    private final LearningTreeRepository learningTreeRepository;
    private final TreeItemRepository treeItemRepository;

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

    // GET — جيب شجرة الطفل الحالية
    @GetMapping("/{childId}")
    public LearningTree getTree(@PathVariable String childId) {
        return learningTreeRepository
            .findByChildIdAndStatus(UUID.fromString(childId), "active")
            .stream()
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No active tree found"));
    }

    // GET — جيب كل الـ items للشجرة
    @GetMapping("/{childId}/items")
    public List<TreeItem> getTreeItems(@PathVariable String childId) {
        LearningTree tree = learningTreeRepository
            .findByChildIdAndStatus(UUID.fromString(childId), "active")
            .stream()
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No active tree found"));
        return treeItemRepository
            .findByTreeIdOrderByOrderNumAsc(tree.getId());
    }

    // PATCH — خلّص item
    @PatchMapping("/item/{itemId}/complete")
    public TreeItem completeItem(@PathVariable String itemId) {
        TreeItem item = treeItemRepository
            .findById(UUID.fromString(itemId))
            .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setIsCompleted(true);
        item.setIsLocked(false);
        item.setCompletedAt(LocalDateTime.now());
        item.setEarnedPoints(item.getMaxPoints());
        return treeItemRepository.save(item);
    }
}