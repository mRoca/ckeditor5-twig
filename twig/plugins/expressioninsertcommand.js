import Command from '@ckeditor/ckeditor5-core/src/command';

export class InsertTwigExpressionCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			// eslint-disable-next-line no-alert
			const content = prompt( 'Content (e.g.: myvar|filter)' );
			if ( !content ) {
				return;
			}
			this.editor.model.insertContent( createTwigExpression( writer, content ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'twigExpression' );

		this.isEnabled = allowedIn !== null;
	}
}

function createTwigExpression( writer, content ) {
	return writer.createElement( 'twigExpression', { content } );
}
