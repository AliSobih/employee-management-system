package com.company.employee_management_system.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class ImageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Upload image and return only the filename
     */
    public String uploadImage(MultipartFile file) {
        log.info("Uploading image: {}", file.getOriginalFilename());
        validateImageFile(file);

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Image uploaded successfully. Filename: {}", uniqueFilename);
            return uniqueFilename; // Return only filename, not full path

        } catch (IOException e) {
            log.error("Failed to upload image: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Delete image by filename
     */
    public void deleteImage(String filename) {
        if (filename == null || filename.isEmpty()) {
            return;
        }

        try {
            Path filePath = Paths.get(uploadDir, filename);
            Files.deleteIfExists(filePath);
            log.info("Image deleted successfully: {}", filename);
        } catch (IOException e) {
            log.warn("Failed to delete image file: {}", e.getMessage());
        }
    }

    /**
     * Get full file path for a filename
     */
    public Path getImagePath(String filename) {
        if (filename == null || filename.isEmpty()) {
            return null;
        }
        return Paths.get(uploadDir, filename);
    }

    /**
     * Validate image file
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.equals("image/jpeg") ||
                        contentType.equals("image/png") ||
                        contentType.equals("image/gif") ||
                        contentType.equals("image/webp") ||
                        contentType.equals("image/jpg"))) {
            throw new IllegalArgumentException("Only JPEG, PNG, GIF, and WebP images are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            throw new IllegalArgumentException("File size must be less than 5MB");
        }
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}