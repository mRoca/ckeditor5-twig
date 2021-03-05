# CKEditor5 twig template plugin

This plugin is not finished yet, but it'll be alive soon :-)

Demo: [mroca.github.io/ckeditor5-twig](https://mroca.github.io/ckeditor5-twig/)

## Usage

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

## Development

```bash
yarn install
yarn watch
```

Then open the `index.html` file.

### Before pushing

```bash
yarn lint-fix
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
