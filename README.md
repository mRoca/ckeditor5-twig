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
                    foo: { type: 'string', label: 'A foo variable you can use into your template' },
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
