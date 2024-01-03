import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionRange } from '@ckeditor/ckeditor5-widget';
import first from '@ckeditor/ckeditor5-utils/src/first';

export default class InsertTwigStatementCommand extends Command {
    execute( options ) {
        options = options || {};
        const editor = this.editor;
        const insertRange = findOptimalInsertionRange( editor.model.document.selection, this.editor.model );

        editor.model.change( writer => {
            const el = createTwigStatement( writer, options );
            let posOffset = 0;
            // Get the text size, if set
            if ( el.getNodeByPath( [ 0, 0 ] ) ) {
                posOffset = el.getNodeByPath( [ 0, 0 ] ).data.length;
            }
            editor.model.insertContent( el, insertRange );
            writer.setSelection( writer.createPositionAt( el.getNodeByPath( [ 0 ] ), posOffset ) );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const firstBlock = first( model.document.selection.getSelectedBlocks() );
        this.isEnabled = !!firstBlock && model.schema.checkChild( firstBlock.parent, 'twigStatementContainer' );
    }
}

function createTwigStatement( writer, options ) {
    const twigStatementContainer = writer.createElement( 'twigStatementContainer' );
    const twigStatement = writer.createElement( 'twigStatement' );
    if ( options.statement ) {
        writer.append( writer.createText( options.statement ), twigStatement );
    }
    writer.append( twigStatement, twigStatementContainer );

    if ( options.withContent ) {
        const twigStatementContent = writer.createElement( 'twigStatementContent' );
        writer.append( twigStatementContent, twigStatementContainer );

        // There must be at least one paragraph for the description to be editable.
        // See https://github.com/ckeditor/ckeditor5/issues/1464.
        writer.appendElement( 'paragraph', twigStatementContent );

        if ( options.withElse ) {
            writer.append( createTwigStatement( writer, { statement: 'else' } ), twigStatementContent );
            writer.appendElement( 'paragraph', twigStatementContent );
        }
    }

    return twigStatementContainer;
}
