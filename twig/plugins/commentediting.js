import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { disableRichTextFor } from '../utils';

/**
 * This plugin allows to deal with {# foobar #}
 * The processor transforms this values into:
 *      <span class="twig-comment">foobar</span>
 */
export default class CommentEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'twigComment', {
			allowWhere: '$block',
			isObject: true,
			isLimit: true,
			isBlock: true
		} );

		schema.extend( '$text', {
			allowIn: 'twigComment',
			isLimit: true
		} );

		disableRichTextFor( schema, 'twigComment' );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// <twigComment> converters
		// Loading the data to the editor
		conversion.for( 'upcast' ).elementToElement( {
			model: 'twigComment',
			view: {
				name: 'div',
				classes: 'twig-comment'
			}
		} );

		// Retrieving the data from the editor
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'twigComment',
			view: {
				name: 'div',
				classes: 'twig-comment'
			}
		} );

		// Rendering the editor content to the user for editing
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'twigComment',
			view: ( modelElement, { writer: viewWriter } ) => {
				const h1 = viewWriter.createEditableElement( 'pre', { class: 'twig-comment' } );

				return toWidgetEditable( h1, viewWriter );
			}
		} );
	}
}
