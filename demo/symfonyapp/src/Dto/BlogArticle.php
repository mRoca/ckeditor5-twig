<?php

namespace App\Dto;

use DateTimeInterface;

class BlogArticle
{
    public string $title;
    public string $content;
    public DateTimeInterface $createdAt;
    /** @var Comment[] */
    public array $comments = [];
}
