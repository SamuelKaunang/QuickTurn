package com.example.QucikTurn.dto;

public record ApplyProjectResponse(
        Long applyId,
        Long projectId,
        Long studentId,
        String status
) {
}