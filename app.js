import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import TwigPlugin from './twig/twigplugin';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, TwigPlugin ],
		toolbar: [ 'heading', 'bold', 'italic', 'bulletedList', 'twigStatement' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized with inspector', editor );

		// Add the inspector (see https://ckeditor.com/docs/ckeditor5/latest/framework/guides/development-tools.html)
		CKEditorInspector.attach( editor );

		// Expose for playing in the console.
		window.editor = editor;
	} )
	.catch( error => {
		console.error( error.stack );
	} );
