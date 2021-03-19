# CKEditor5 twig template plugin

This CKEditor5 plugin allows editing [Twig](https://twig.symfony.com/) templates.

Demo: [mroca.github.io/ckeditor5-twig](https://mroca.github.io/ckeditor5-twig/)

Features:

- Display all available variables, their type & children.
- `{{ variable|filter }}`
- `{% tag %}` blocks
- `{% tag %} with content {% endtag %}` blocks
- `{# comments #}`
- Don't parse the [HTML embed](https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html) divs
- Allow using variables into images src

## Usage

[Install CKEditor5](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#scenario-2-building-from-source).

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

### Images

The plugin brings an `Image` feature allowing to use twig expression as `src` value, e.g.: `"https://cdn.my.site/images/" ~ user.avatar`
When using a twig expression as image `src`, a grey image is displayed with the `src` value on it.

You must [install the Image plugin](https://ckeditor.com/docs/ckeditor5/latest/features/image.html)
in order to use it with the Twig plugin:

```bash
yarn add @ckeditor/ckeditor5-image
```
```javascript
import Image from '@ckeditor/ckeditor5-image/src/image';

ClassicEditor.create( document.querySelector( '#editor' ), {
    plugins: ['...', TwigPlugin, Image]
});
```

### Symfony integration

A PHP `TwigVariablesExtractor` class allows to convert an array of items (objects, entities, arrays, types, ...)
into a `variables` array that can be used as plugin config.

This class is currently located into `demo/symfonyapp/src/Extractor`, and will later be moved into a dedicated repository
and composer package.

**Extractor options**

```php
$propertyInfoExtractor = new PropertyInfoExtractor('...');
$extractor = new TwigVariablesExtractor($propertyInfoExtractor, [
	'circular_reference_limit' => 1,
	'max_depth' => 4,
]);
```

**Groups & Serializer**

If there are too many object properties to parse, you can use the `@Groups` serializer annotation, then use the
[serializer_groups context option](https://symfony.com/doc/current/components/property_info.html#serializerextractor)

```php
$extractor = new TwigVariablesExtractor();
$variables = $extractor->extract($types, ['serializer_groups' => ['foo']]);
```

**Variables types**

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

### Override translations

All translations are defined in the `twig/twigpluginui.js` file. Each one can be overridden by
[adding the translation](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/localization.html#using-the-windowckeditor_translations-object)

## Development

### CKEditor plugin

```bash
yarn install
yarn watch
```

Then open the `index.html` file (with the `Run` button in PhpStorm / WebStorm, for instance).

**Before pushing**

```bash
yarn lint:fix
yarn stylelint:fix
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

**Before pushing**

```bash
cd demo/symfonyapp
vendor/bin/php-cs-fixer fix
```

## Known issues

- As the twig tags are replaced by a `div`, they cannot be used into `a`, `ul` list without breaking the html:
    ```twig
    <ul>
        {% for a in b %}
            <li>{{ a }}</li>
        {% endfor %}
    </ul>

    <ul>
        {# This comment should be replaced by a "li" tag, as it is located into an "ul" tag #}
        <li>This is a list item</li>
    </ul>
    ```
- Inline blocks are not handled for now:
    ```twig
    <p>{% if a %}yes{% else %}no{% endif %}</p>
    ```
- The block statement content part must have a parent Paragraph in order to be writable.
  A Paragraph is currently added into each block content
-  `else` is not well-supported for now as part of the graphical `if` / `for` block

## TODO

- Deal with inline & `li` statements
- Allow passing available functions & filters into the variables list
- Validate the twig template with [twig.js](https://github.com/twigjs/twig.js)
- Add the [auto reload plugin](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/saving-data.html)
  to the demo page
