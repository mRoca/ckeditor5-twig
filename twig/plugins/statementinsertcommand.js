import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget';

export class InsertTwigStatementCommand extends Command {
    execute() {
        executeCommand.bind( this )( false );
    }

    refresh() {
        refreshStatement.bind( this )();
    }
}

export class InsertTwigStatementWithContentCommand extends Command {
    execute() {
        executeCommand.bind( this )( true );
    }

    refresh() {
        refreshStatement.bind( this )();
    }
}

function executeCommand( withContent ) {
    const editor = this.editor;
    const insertPosition = findOptimalInsertionPosition( editor.model.document.selection, this.editor.model );

    editor.model.change( writer => {
        const el = createTwigStatement( writer, withContent );
        editor.model.insertContent( el, insertPosition );
        writer.setSelection( writer.createPositionAt( el.getNodeByPath( [ 0 ] ), 0 ) );
    } );
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
    // writer.appendElement( 'paragraph', twigStatementContent );
    }

    return twigStatementContainer;
}
