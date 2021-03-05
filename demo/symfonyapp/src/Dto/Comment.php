<?php

namespace App\Dto;

class Comment
{
    public User $author;
    public BlogArticle $article;
    public string $content;
}
