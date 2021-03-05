<?php

namespace App\Controller;

use App\Dto\BlogArticle;
use App\Dto\Comment;
use App\Dto\User;
use App\Extractor\TwigVariablesExtractor;
use DateTimeImmutable;
use DateTimeInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends AbstractController
{
    public function index(): Response
    {
        // Option 1: variables as an array
        // $variables = ['name' => ['type' => 'string']];

        // Option 2: TwigVariablesExtractor & variables defined as an object's properties
        // $variables = $extractor->extract(MyTemplateVariablesObject::class);

        // Option 3: TwigVariablesExtractor & variables defined in an array
        $extractor = new TwigVariablesExtractor();
        $variables = $extractor->extract([
            'app' => [                                      // Manually defined config
                'type' => 'object',
                'label' => 'All app related global variables',
                'properties' => [
                    'debug' => ['type' => 'boolean', 'label' => 'Is debug enabled?'],
                    'environment' => ['type' => 'string', 'label' => 'Current app env: dev or prod'],
                ]
            ],
            'siteTitle' => 'string',                        // type as string
            'user' => User::class,                          // object & children
            'article' => BlogArticle::class,                // class name
            'comments' => [                                 // array with ONE item type
                Comment::class                              // array content type
            ],
            'calendar' => [                                 // associative array as object
                'now' => 'datetime',                        // type name
                'yesterday' => DateTimeInterface::class,   // interface name
                'tomorrow' => new DateTimeImmutable(),      // object
            ],
        ]);

        return $this->render('default/index.html.twig', [
            'variables' => $variables,
        ]);
    }
}
