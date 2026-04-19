package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.article.ArticleResponse;
import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.entity.Article;
import com.rafeeq.backend.entity.SavedArticle;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.repository.ArticleRepository;
import com.rafeeq.backend.repository.SavedArticleRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final SavedArticleRepository savedArticleRepository;
    private final UserRepository userRepository;

    public List<ArticleResponse> list(String nationalId) {
        User user = getCurrentUser(nationalId);
        Set<UUID> savedArticleIds = savedArticleRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(savedArticle -> savedArticle.getArticle().getId())
                .collect(Collectors.toSet());

        return articleRepository.findAllByOrderByTitleArAsc()
                .stream()
                .map(article -> map(article, savedArticleIds.contains(article.getId())))
                .toList();
    }

    public ArticleResponse one(UUID id, String nationalId) {
        User user = getCurrentUser(nationalId);
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Article not found"));

        boolean saved = savedArticleRepository.findByUserIdAndArticleId(user.getId(), id).isPresent();
        return map(article, saved);
    }

    @Transactional
    public MessageResponse save(UUID id, String nationalId) {
        User user = getCurrentUser(nationalId);
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Article not found"));

        if (savedArticleRepository.findByUserIdAndArticleId(user.getId(), article.getId()).isEmpty()) {
            SavedArticle savedArticle = new SavedArticle();
            savedArticle.setUser(user);
            savedArticle.setArticle(article);
            savedArticleRepository.save(savedArticle);
        }

        return new MessageResponse(true, "Article saved");
    }

    @Transactional
    public MessageResponse unsave(UUID id, String nationalId) {
        User user = getCurrentUser(nationalId);
        SavedArticle savedArticle = savedArticleRepository.findByUserIdAndArticleId(user.getId(), id)
                .orElseThrow(() -> new NotFoundException("Saved article not found"));
        savedArticleRepository.delete(savedArticle);
        return new MessageResponse(true, "Article unsaved");
    }

    private User getCurrentUser(String nationalId) {
        return userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private ArticleResponse map(Article article, boolean saved) {
        return new ArticleResponse(
                article.getId(),
                article.getTitleAr(),
                article.getTitleEn(),
                article.getContentAr(),
                article.getContentEn(),
                article.getImageUrl(),
                saved
        );
    }
}
