import { toArray } from '@ckeditor/ckeditor5-utils';
import { Command } from '@ckeditor/ckeditor5-core';
import Swal from 'sweetalert2';
import { srcToSvgSrc } from './utils';

export default class InsertTwigImageCommand extends Command {
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedEl = selection.getSelectedElement();

        this.isEnabled = this.editor.plugins.get( 'ImageUtils' ).isImageAllowed();

        if ( !!selectedEl && selectedEl.is( 'element', 'image' ) ) {
            this.value = selectedEl.getAttribute( 'src' );
        } else {
            this.value = undefined;
        }
    }

    async execute( options ) {
        options = options || {};

        if ( !options.source ) {
            options.source = await this._displayModale( this.value );
        }

        if ( !options.source ) {
            return;
        }

        for ( let src of toArray( options.source ) ) {
            if ( !src.indexOf( '{{' ) >= 0 ) {
                src = '{{ ' + src + ' }}';
            }
            this.editor.plugins.get( 'ImageUtils' ).insertImage( { src: srcToSvgSrc( src ) }, null, 'imageInline', { setImageSizes: false } );
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
            cancelButtonText: t( 'twig.cancel' ),
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
