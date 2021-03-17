import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { disableRichTextFor } from '../utils';

/**
 * This plugin allows to deal with {# foobar #}
 * The processor transforms this values into:
 *      <section class="twig-comment-container">
 *          <div class="twig-comment">foobar</div>
 *      </section>
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

		schema.register( 'twigCommentContainer', {
			isObject: true,
			allowWhere: '$block'
		} );

		schema.register( 'twigComment', {
			isLimit: true,
			allowIn: 'twigCommentContainer',
			isBlock: true,
			allowContentOf: '$text'
		} );

		schema.extend( '$text', {
			allowIn: 'twigComment',
			isLimit: true
		} );

		disableRichTextFor( schema, 'twigComment' );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// <twigCommentContainer> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'twigCommentContainer',
			view: {
				name: 'section',
				classes: 'twig-comment-container'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'twigCommentContainer',
			view: {
				name: 'section',
				classes: 'twig-comment-container'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'twigCommentContainer',
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'twig-comment-container' } );

				return toWidget( section, viewWriter, { label: 'twig comment widget' } );
			}
		} );

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
				const pre = viewWriter.createEditableElement( 'pre', { class: 'twig-comment' } );

				return toWidgetEditable( pre, viewWriter );
			}
		} );
	}
}
