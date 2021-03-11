# CKEditor5 twig template plugin

This CKEditor5 plugin allows editing [Twig](https://twig.symfony.com/) templates.

Demo: [mroca.github.io/ckeditor5-twig](https://mroca.github.io/ckeditor5-twig/)

Features:

- Display all available variables, their type & children.
- `{{ variable|filter }}`
- `{% tag %}` blocks
- `{% tag %} with content {% endtag %}` blocks
- `{# comments #}`

## Usage

You must use the same major CKEditor version as the one supported by this plugin (see the `package.json` file).
If you get a `ckeditor-duplicated-modules` error, you have mismatching versions.

```bash
yarn add ckeditor5-twig
```

```javascript
import TwigPlugin from 'ckeditor5-twig/twig/twigplugin';
import 'ckeditor5-twig/twig/plugin.css';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ '...', TwigPlugin ],
        toolbar: [ '...', 'twigCommands' ],
        config: {
            ...,
            twig: {
                variables: {
                    username: { type: 'string', label: 'The current user\'s username' },
                    country: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            name: { type: 'string', label: 'The country name' },
                            cities: {
                                type: 'array',
                                label: 'All the country\'s cities',
                                children: { type: 'string', label: 'The city name' }
                            },
                        }
                    },
                }
            }
        }
    } )
    .then( '...' )
    .catch( '...' );
```

Translations are currently available for `EN` and `FR` locales (see the `twig/twigpluginui.js` file).

### Symfony integration

A PHP `TwigVariablesExtractor` class allows to convert an array of items (objects, entities, arrays, types, ...)
into a `variables` array that can be used as plugin config.

This class is currently located into `demo/symfonyapp/src/Extractor`, and will later be moved into a dedicated repository
and composer package.

```php
<?php

namespace App\Controller;

use App\Extractor\TwigVariablesExtractor;
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
        $variables = [
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
                'yesterday' => \DateTimeInterface::class,   // interface name
                'tomorrow' => new \DateTimeImmutable(),     // object
            ],
        ];

        $extractor = new TwigVariablesExtractor();
        return $this->render('default/index.html.twig', [
            'variables' => $extractor->extract($variables),
        ]);
    }
}
```

## Development

```bash
yarn install
yarn watch
```

Then open the `index.html` file (with the `Run` button in PhpStorm / WebStorm, for instance).

### Before pushing

```bash
yarn lint:fix
```

### Demo symfony project

Install the [Symfony CLI](https://symfony.com/download), then:
```bash
cd demo/symfonyapp
composer install
yarn install
(yarn encore dev-server --port 8880 & symfony server:start --port 8000 --no-tls)
# or run the two commands in a different terminal
```

Then access the [demo page](http://127.0.0.1:8000)
