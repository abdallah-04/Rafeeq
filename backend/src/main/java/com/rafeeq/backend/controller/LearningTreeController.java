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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tree")
@RequiredArgsConstructor
public class LearningTreeController {

    private final OpenAiService openAiService;
    private final LearningTreeService learningTreeService;
    private final LearningTreeRepository learningTreeRepository;
    private final TreeItemRepository treeItemRepository;

    // TEST
    @GetMapping("/test")
    public String testAi() throws Exception {
        return openAiService.generateLearningTree(
            "أحمد", 5, "الأرقام ١-١٠", "Numbers 1-10", 1
        );
    }

    // GENERATE
    @PostMapping("/generate/{childId}")
    public String generate(@PathVariable String childId) throws Exception {
        learningTreeService.generateTree(childId);
        return "✅ Tree generated successfully!";
    }

    // GET tree
    @GetMapping("/{childId}")
    public LearningTree getTree(@PathVariable String childId) {
        return learningTreeRepository
            .findByChildIdAndStatus(UUID.fromString(childId), "active")
            .stream()
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No active tree found"));
    }

    // GET items
    @GetMapping("/{childId}/items")
    public List<TreeItem> getTreeItems(@PathVariable String childId) {
        LearningTree tree = learningTreeRepository
            .findByChildIdAndStatus(UUID.fromString(childId), "active")
            .stream()
            .findFirst()
            .orElseThrow(() -> new RuntimeException("No active tree found"));
        return treeItemRepository.findByTreeIdOrderByOrderNumAsc(tree.getId());
    }

    // PATCH — complete item + check score
    @PatchMapping("/item/{itemId}/complete")
    public Map<String, Object> completeItem(
            @PathVariable String itemId) throws Exception {

        // 1. خلّص الـ item
        TreeItem item = treeItemRepository
            .findById(UUID.fromString(itemId))
            .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setIsCompleted(true);
        item.setIsLocked(false);
        item.setCompletedAt(LocalDateTime.now());
        item.setEarnedPoints(item.getMaxPoints());
        treeItemRepository.save(item);

        // 2. جيب كل الـ items
        UUID treeId = item.getTree().getId();
        List<TreeItem> allItems = treeItemRepository
            .findByTreeIdOrderByOrderNumAsc(treeId);

        // 3. هل كل الـ items خلصت؟
        boolean allCompleted = allItems.stream()
            .allMatch(TreeItem::getIsCompleted);

        if (!allCompleted) {
            return Map.of(
                "treeCompleted", false,
                "message", "Keep going! 💪"
            );
        }

        // 4. احسب النسبة
        int totalEarned = allItems.stream()
            .mapToInt(TreeItem::getEarnedPoints).sum();
        int totalMax = allItems.stream()
            .mapToInt(TreeItem::getMaxPoints).sum();
        double percentage = (totalEarned * 100.0) / totalMax;

        // 5. حدّث الشجرة الحالية
        LearningTree currentTree = learningTreeRepository
            .findById(treeId)
            .orElseThrow(() -> new RuntimeException("Tree not found"));
        currentTree.setStatus("completed");
        learningTreeRepository.save(currentTree);

        String childId = currentTree.getChild().getId().toString();

        // 6. ولّد شجرة جديدة
        if (percentage >= 85) {
            LearningTree newTree = learningTreeService.generateTree(childId);
            return Map.of(
                "treeCompleted", true,
                "passed", true,
                "percentage", Math.round(percentage) + "%",
                "message", "🎉 ممتاز! انتقلت للمستوى التالي!",
                "newTreeId", newTree.getId().toString()
            );
        } else {
            LearningTree revTree = learningTreeService.generateRevisionTree(childId);
            return Map.of(
                "treeCompleted", true,
                "passed", false,
                "percentage", Math.round(percentage) + "%",
                "message", "📚 هيا نراجع ونحاول مجدداً!",
                "revisionTreeId", revTree.getId().toString()
            );
        }
    }
}