import Command from '@ckeditor/ckeditor5-core/src/command';
import Swal from 'sweetalert2';

export class InsertTwigExpressionCommand extends Command {
    async execute( value ) {
        const editor = this.editor;

        value = value || await this._displayModale();

        if ( !value ) {
            return;
        }

        editor.model.change( async writer => {
            const el = createTwigExpression( writer, value );
            editor.model.insertContent( el );
            writer.setSelection( el, 'after' );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'twigExpression' );

        this.isEnabled = allowedIn !== null;
    }

    async _displayModale() {
        const t = this.editor.t;
        const { value } = await Swal.fire( {
            title: t( 'twig.expression' ),
            input: 'text',
            inputLabel: t( 'twig.expression.label' ),
            showCancelButton: true,
            confirmButtonText: t( 'twig.expression.insert' ),
            inputValidator: value => {
                if ( !value.trim() ) {
                    return t( 'twig.expression.required' );
                }
            },
            footer: 'Twig documentation:&nbsp;<a href="https://twig.symfony.com/doc/3.x/" target="_blank">https://twig.symfony.com<a>'
        } );

        return value;
    }
}

function createTwigExpression( writer, content ) {
    return writer.createElement( 'twigExpression', { content } );
}
