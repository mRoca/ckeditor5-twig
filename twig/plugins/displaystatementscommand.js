import Command from '@ckeditor/ckeditor5-core/src/command';
import Swal from 'sweetalert2';
import htmlContent from './displaystatementscommand.html';
import first from '@ckeditor/ckeditor5-utils/src/first';

export class DisplayTwigAvailableStatementsCommand extends Command {
    execute() {
        const editor = this.editor;
        const t = editor.t;

        editor.model.change( async () => {
            const result = await Swal.fire( {
                title: t( 'twig.statement-with-content' ),
                width: '80%',
                html: htmlContent,
                confirmButtonText: t( 'twig.statements.insert' ),
                footer: 'Twig documentation:&nbsp;<a href="https://twig.symfony.com/doc/3.x/" target="_blank">https://twig.symfony.com<a>'
            } );

            if ( result.isConfirmed ) {
                editor.execute( 'insertTwigStatementWithContent' );
                editor.editing.view.focus();
            }
        } );
    }

    refresh() {
        const model = this.editor.model;
        const firstBlock = first( model.document.selection.getSelectedBlocks() );
        this.isEnabled = !!firstBlock && model.schema.checkChild( firstBlock.parent, 'twigStatementContainer' );
    }
}
