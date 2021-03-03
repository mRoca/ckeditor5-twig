import Command from '@ckeditor/ckeditor5-core/src/command';

export class InsertTwigCommentCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			this.editor.model.insertContent( createTwigComment( writer ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'twigComment' );

		this.isEnabled = allowedIn !== null;
	}
}

function createTwigComment( writer ) {
	return writer.createElement( 'twigComment' );
}
