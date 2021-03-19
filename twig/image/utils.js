import { b64ToUtf8, utf8ToB64 } from '../utils';
import defaultImage from 'raw-loader!./default_image.svg';

export const svgSrcPrefix = 'data:image/svg+xml;base64,';

/**
 * @param {string} src
 * @returns {string}
 */
export function srcToSvgSrc( src ) {
    return svgSrcPrefix + utf8ToB64( defaultImage.replace( 'IMG_URL', src ) );
}

/**
 * @param {string} svgSrc
 * @returns {string|undefined}
 */
export function svgSrcToSrc( svgSrc ) {
    if ( !svgSrc || svgSrc.indexOf( svgSrcPrefix ) !== 0 ) {
        return undefined;
    }
    const svg = b64ToUtf8( svgSrc.replace( svgSrcPrefix, '' ) );

    const parser = new DOMParser();
    const doc = parser.parseFromString( svg, 'image/svg+xml' );
    const srcEl = doc.getElementById( 'twig-src' );
    if ( !srcEl ) {
        return undefined;
    }

    return srcEl.innerHTML;
}
