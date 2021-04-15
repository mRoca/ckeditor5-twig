<?php

namespace App\Dto;

class BlogArticle
{
    public string $title;
    public string $content;
    public \DateTimeInterface $createdAt;
    /** @var Comment[]|\Traversable */
    public $comments = [];
}
