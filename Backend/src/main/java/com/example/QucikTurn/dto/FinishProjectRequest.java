package com.example.QucikTurn.dto;

import jakarta.validation.constraints.NotBlank;

public class FinishProjectRequest {
    @NotBlank(message = "Link hasil pekerjaan tidak boleh kosong")
    private String finishingLink;

    // Getters and Setters
    public String getFinishingLink() {
        return finishingLink;
    }

    public void setFinishingLink(String finishingLink) {
        this.finishingLink = finishingLink;
    }
}
