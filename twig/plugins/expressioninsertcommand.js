import Command from '@ckeditor/ckeditor5-core/src/command';
import Swal from 'sweetalert2';

export class InsertTwigExpressionCommand extends Command {
    async execute( value ) {
        const editor = this.editor;

        value = value || await this._displayModale( this.value );

        if ( !value ) {
            return;
        }

        editor.model.change( writer => {
            const el = createTwigExpression( writer, value );
            editor.model.insertContent( el );
            writer.setSelection( el, 'on' );
            editor.editing.view.focus(); // Must be called here, as this function is after an await
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedEl = selection.getSelectedElement();

        if ( !!selectedEl && selectedEl.is( 'element', 'twigExpression' ) ) {
            this.value = selectedEl.getAttribute( 'content' );
        } else {
            this.value = undefined;
        }

        this.isEnabled = model.schema.checkChild( selection.focus.parent, 'twigExpression' );
    }

    async _displayModale( currentValue ) {
        const t = this.editor.t;
        const { value } = await Swal.fire( {
            title: t( 'twig.expression' ),
            input: 'text',
            inputLabel: t( 'twig.expression.label' ),
            inputValue: currentValue || '',
            showCancelButton: true,
            confirmButtonText: t( 'twig.expression.insert' ),
            inputValidator: value => {
                if ( !value.trim() ) {
                    return t( 'twig.expression.required' );
                }
            }
        } );

        return value;
    }
}

function createTwigExpression( writer, content ) {
    return writer.createElement( 'twigExpression', { content } );
}
