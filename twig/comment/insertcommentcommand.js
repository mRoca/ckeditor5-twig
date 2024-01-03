import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionRange } from '@ckeditor/ckeditor5-widget';
import first from '@ckeditor/ckeditor5-utils/src/first';

export default class InsertTwigCommentCommand extends Command {
    execute() {
        const insertPosition = findOptimalInsertionRange( this.editor.model.document.selection, this.editor.model );

        this.editor.model.change( writer => {
            const el = createTwigComment( writer );
            this.editor.model.insertContent( el, insertPosition );
            writer.setSelection( writer.createPositionAt( el.getNodeByPath( [ 0 ] ), 0 ) );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const firstBlock = first( model.document.selection.getSelectedBlocks() );
        this.isEnabled = !!firstBlock && model.schema.checkChild( firstBlock.parent, 'twigCommentContainer' );
    }
}

function createTwigComment( writer ) {
    const twigCommentContainer = writer.createElement( 'twigCommentContainer' );
    const twigComment = writer.createElement( 'twigComment' );
    writer.append( twigComment, twigCommentContainer );

    return twigCommentContainer;
}
