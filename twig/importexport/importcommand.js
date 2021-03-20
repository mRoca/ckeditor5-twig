import Command from '@ckeditor/ckeditor5-core/src/command';
import Swal from 'sweetalert2';
import prettydiff from 'prettydiff';

export default class ImportCommand extends Command {
    execute() {
        const editor = this.editor;
        const t = editor.t;

        editor.model.change( async () => {
            const result = await Swal.fire( {
                title: t( 'twig.import-export' ),
                width: '80%',
                input: 'textarea',
                inputLabel: t( 'twig.import.label' ),
                inputValue: this._formatOutput( editor.getData() ) || '',
                showCancelButton: true,
                confirmButtonText: t( 'twig.import' ),
                customClass: {
                    input: 'twig-import'
                }
            } );

            if ( result.value ) {
                editor.setData( result.value );
                editor.editing.view.focus();
            }
        } );
    }

    refresh() {
        this.isEnabled = true;
    }

    _formatOutput( data ) {
        prettydiff.options.mode = 'beautify';
        prettydiff.options.language = 'twig';
        prettydiff.options.force_indent = true;
        prettydiff.options.source = data;

        return prettydiff();
    }
}
