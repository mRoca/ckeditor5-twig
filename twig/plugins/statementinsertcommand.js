import Command from '@ckeditor/ckeditor5-core/src/command';

export class InsertTwigStatementCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			this.editor.model.insertContent( createTwigStatement( writer ) );
		} );
	}

	refresh() {
		refreshStatement.bind( this )();
	}
}

export class InsertTwigStatementWithContentCommand extends Command {
	execute() {
		this.editor.model.change( writer => {
			this.editor.model.insertContent( createTwigStatement( writer, true ) );
		} );
	}

	refresh() {
		refreshStatement.bind( this )();
	}
}

function refreshStatement() {
	const model = this.editor.model;
	const selection = model.document.selection;
	const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'twigStatementContainer' );

	this.isEnabled = allowedIn !== null;
}

function createTwigStatement( writer, withContent ) {
	const twigStatementContainer = writer.createElement( 'twigStatementContainer' );
	const twigStatement = writer.createElement( 'twigStatement' );
	writer.append( twigStatement, twigStatementContainer );

	if ( withContent ) {
		const twigStatementContent = writer.createElement( 'twigStatementContent' );
		writer.append( twigStatementContent, twigStatementContainer );

		// There must be at least one paragraph for the description to be editable.
		// See https://github.com/ckeditor/ckeditor5/issues/1464.
		writer.appendElement( 'paragraph', twigStatementContent );
	}

	return twigStatementContainer;
}
