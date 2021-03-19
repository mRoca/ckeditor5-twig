import { Controller } from 'stimulus';

/* ckeditor */
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Image from "@ckeditor/ckeditor5-image/src/image";
import HtmlEmbed from "@ckeditor/ckeditor5-html-embed/src/htmlembed";

/* twig plugin */
import TwigPlugin from 'ckeditor5-twig/twig/twigplugin';
import 'ckeditor5-twig/twig/plugin.css';

export default class extends Controller {
	static values = {
		variables: Object,
	}

	connect() {
		ClassicEditor
			.create( this.element, {
				plugins: [ Essentials, Paragraph, Heading, Bold, Italic, HtmlEmbed, Image, TwigPlugin ],
				toolbar: [ 'heading', 'bold', 'italic', 'htmlEmbed', 'twigCommands' ],
				twig: {
					variables: this.variablesValue || {},
				}
			} )
			.catch( error => {
				console.error( error );
			} );
	}
}
