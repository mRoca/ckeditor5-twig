import { insertImage, isImageAllowed } from '@ckeditor/ckeditor5-image/src/image/utils';
import { toArray } from '@ckeditor/ckeditor5-utils';
import { Command } from '@ckeditor/ckeditor5-core';
import Swal from 'sweetalert2';
import { srcToSvgSrc } from './utils';

export default class InsertTwigImageCommand extends Command {
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedEl = selection.getSelectedElement();

        this.isEnabled = isImageAllowed( model );

        if ( !!selectedEl && selectedEl.is( 'element', 'image' ) ) {
            this.value = selectedEl.getAttribute( 'src' );
        } else {
            this.value = undefined;
        }
    }

    async execute( options ) {
        const model = this.editor.model;

        options = options || {};

        if ( !options.source ) {
            options.source = await this._displayModale( this.value );
        }

        if ( !options.source ) {
            return;
        }

        for ( const src of toArray( options.source ) ) {
            insertImage( model, { src: srcToSvgSrc( src ) } );
        }
    }

    async _displayModale( currentValue ) {
        const t = this.editor.t;
        const { value } = await Swal.fire( {
            title: t( 'twig.image' ),
            width: '60%',
            input: 'text',
            inputLabel: t( 'twig.image.label' ),
            inputValue: currentValue || '',
            showCancelButton: true,
            confirmButtonText: t( 'twig.image.insert' ),
            inputValidator: value => {
                if ( !value.trim() ) {
                    return t( 'twig.image.required' );
                }
            }
        } );

        return value;
    }
}
