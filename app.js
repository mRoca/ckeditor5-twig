import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

/* twig plugin files */
import TwigPlugin from './twig/twigplugin';
import './twig/plugin.css';

/* demo page scripts */
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import prettydiff from 'prettydiff';
import hljs from 'highlight.js';

/* demo page style */
import './demo.css';
import 'highlight.js/styles/agate.css';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Image, ImageResize, HtmlEmbed, TwigPlugin ],
        toolbar: [ 'heading', 'bold', 'italic', 'bulletedList', 'htmlEmbed', 'twigCommands' ],
        twig: {
            variables: window.availableVariables // Defined in the index.html file
        }
    } )
    .then( editor => {
    // Add the inspector (see https://ckeditor.com/docs/ckeditor5/latest/framework/guides/development-tools.html)
        CKEditorInspector.attach( editor, { isCollapsed: true } );

        // Expose for playing in the console.
        window.editor = editor;
    } )
    .catch( error => {
        console.error( error.stack );
    } );

window.displaySource = function() {
    prettydiff.options.mode = 'beautify';
    prettydiff.options.language = 'twig';
    prettydiff.options.force_indent = true;
    prettydiff.options.source = window.editor.getData();

    document.getElementById( 'output' ).innerText = prettydiff();
    hljs.highlightBlock( document.getElementById( 'output' ) );
};

document.addEventListener( 'DOMContentLoaded', () => {
    window.displaySource();
} );
