import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { disableRichTextFor } from '../utils';

/**
 * This plugin allows to deal with {% foo bar %}, {% foo(bar) %}, and {% foo bar %}baz{% endfoo %}
 * The processor transforms those values into:
 *      <section class="twig-statement-container">
 *         <div class="twig-statement">foo bar</div>
 *         <div class="twig-statement-content">baz</div>
 *      </section>
 */
export default class TwigPluginEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'twigStatementContainer', {
			isObject: true,
			allowWhere: '$block'
		} );

		schema.register( 'twigStatement', {
			isLimit: true,
			allowIn: 'twigStatementContainer',
			isBlock: true
		} );

		schema.extend( '$text', {
			allowIn: 'twigStatement',
			isLimit: true
		} );

		disableRichTextFor( schema, 'twigStatement' );

		schema.register( 'twigStatementContent', {
			isLimit: true,
			allowIn: 'twigStatementContainer',
			allowContentOf: '$root'
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// <twigStatementContainer> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'twigStatementContainer',
			view: {
				name: 'section',
				classes: 'twig-statement-container'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'twigStatementContainer',
			view: {
				name: 'section',
				classes: 'twig-statement-container'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'twigStatementContainer',
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'section', { class: 'twig-statement-container' } );

				return toWidget( section, viewWriter, { label: 'twig statement widget' } );
			}
		} );

		// <twigStatement> converters
		// Loading the data to the editor
		conversion.for( 'upcast' ).elementToElement( {
			model: 'twigStatement',
			view: {
				name: 'div',
				classes: 'twig-statement'
			}
		} );

		// Retrieving the data from the editor
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'twigStatement',
			view: {
				name: 'div',
				classes: 'twig-statement'
			}
		} );

		// Rendering the editor content to the user for editing
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'twigStatement',
			view: ( modelElement, { writer: viewWriter } ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const h1 = viewWriter.createEditableElement( 'pre', { class: 'twig-statement' } );

				return toWidgetEditable( h1, viewWriter );
			}
		} );

		// <twigStatementContent> converters
		conversion.for( 'upcast' ).elementToElement( {
			model: 'twigStatementContent',
			view: {
				name: 'div',
				classes: 'twig-statement-content'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'twigStatementContent',
			view: {
				name: 'div',
				classes: 'twig-statement-content'
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'twigStatementContent',
			view: ( modelElement, { writer: viewWriter } ) => {
				// Note: You use a more specialized createEditableElement() method here.
				const div = viewWriter.createEditableElement( 'div', { class: 'twig-statement-content' } );

				return toWidgetEditable( div, viewWriter );
			}
		} );
	}
}
