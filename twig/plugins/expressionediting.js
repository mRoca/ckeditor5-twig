import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { disableRichTextFor } from '../utils';

/**
 * This plugin allows to deal with {{ foobar|filter }}
 * The processor transforms this values into:
 *      <span class="twig-expression">foobar|filter</span>
 */
export default class ExpressionEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'twig-expression' ) )
		);
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'twigExpression', {
			isInline: true,
			isObject: true,
			allowWhere: '$text',
			allowAttributes: [ 'content' ]
		} );

		disableRichTextFor( schema, 'twigExpression' );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// <twigExpression content="abc"> converters

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'twig-expression' ]
			},
			model: ( viewElement, { writer: modelWriter } ) => {
				const content = viewElement.getChild( 0 ).data;

				return modelWriter.createElement( 'twigExpression', { content } );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'twigExpression',
			view: ( modelItem, { writer: viewWriter } ) => toWidget( createPlaceholderView( modelItem, viewWriter ), viewWriter )
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'twigExpression',
			view: ( modelItem, { writer: viewWriter } ) => createPlaceholderView( modelItem, viewWriter )
		} );

		function createPlaceholderView( modelItem, viewWriter ) {
			const content = modelItem.getAttribute( 'content' );
			const elementView = viewWriter.createContainerElement( 'span', { class: 'twig-expression' } );
			const innerText = viewWriter.createText( content );
			viewWriter.insert( viewWriter.createPositionAt( elementView, 0 ), innerText );

			return elementView;
		}
	}
}
