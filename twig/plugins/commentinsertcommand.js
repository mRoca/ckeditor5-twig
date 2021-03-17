import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget';

export class InsertTwigCommentCommand extends Command {
	execute() {
		const insertPosition = findOptimalInsertionPosition( this.editor.model.document.selection, this.editor.model );

		this.editor.model.change( writer => {
			const el = createTwigComment( writer );
			this.editor.model.insertContent( el, insertPosition );
			writer.setSelection( writer.createPositionAt( el.getNodeByPath( [ 0 ] ), 0 ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'twigCommentContainer' );

		this.isEnabled = allowedIn !== null;
	}
}

function createTwigComment( writer ) {
	const twigCommentContainer = writer.createElement( 'twigCommentContainer' );
	const twigComment = writer.createElement( 'twigComment' );
	writer.append( twigComment, twigCommentContainer );

	return twigCommentContainer;
}
