package com.example.QucikTurn.dto;

public class ReviewRequest {
    private Integer rating;
    private String comment;

    // Getters and Setters
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}