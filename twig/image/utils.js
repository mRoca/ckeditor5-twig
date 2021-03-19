import { b64ToUtf8, utf8ToB64 } from '../utils';

// This is the default image sag. We could have imported it with the following :
//     import defaultImage from 'raw-loader!./default_image.svg';
// but it's not working when using this code from the node_modules dir in another project.
// The other option would have been to ask the plugin users to add some lines into their webpack.config.js file,
// but it's not that simple : https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#webpack-configuration
const defaultImage = `<svg xmlns="http://www.w3.org/2000/svg" width="300px" height="200px" fill="white">
    <rect width="100%" height="100%" fill="#aaa"/>
    <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        lengthAdjust="spacingAndGlyphs"
        textLength="220"
        id="twig-src"
    >IMG_URL</text>
</svg>`;

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
