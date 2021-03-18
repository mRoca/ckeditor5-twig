import Command from '@ckeditor/ckeditor5-core/src/command';
import Swal from 'sweetalert2';
import htmlContent from 'raw-loader!./displaystatementscommand.html';
import first from '@ckeditor/ckeditor5-utils/src/first';

export class DisplayTwigAvailableStatementsCommand extends Command {
    execute() {
        const editor = this.editor;
        const t = editor.t;

        editor.model.change( async () => {
            const result = await Swal.fire( {
                title: t( 'twig.statement-with-content' ),
                width: '90%',
                html: htmlContent.replaceAll( 'twig.statements.insert', t( 'twig.statements.insert' ) ),
                showConfirmButton: false,
                footer: 'Twig documentation:&nbsp;<a href="https://twig.symfony.com/doc/3.x/" target="_blank">https://twig.symfony.com<a>',
                didOpen: popup => {
                    const buttons = popup.querySelectorAll( 'button' );
                    buttons.forEach( el => el.addEventListener( 'click', event => {
                        const btn = event.target;
                        editor.execute( 'insertTwigStatement', {
                            statement: btn.getAttribute( 'data-statement' ),
                            withElse: btn.hasAttribute( 'data-with-else' ),
                            withContent: true
                        } );
                        editor.editing.view.focus();
                        Swal.close();
                    } ) );
                }
            } );

            if ( result.isConfirmed ) {
                editor.execute( 'insertTwigStatement', { withContent: true } );
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
