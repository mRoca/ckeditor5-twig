import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { b64ToUtf8, htmlDecode, htmlEncode, utf8ToB64 } from './utils';
import { srcToSvgSrc, svgSrcPrefix, svgSrcToSrc } from './image/utils';

export default class TwigDataProcessor {
    constructor( document ) {
        this._htmlDP = new HtmlDataProcessor( document );
    }

    toView( data ) {
        const html = twig2html( data );
        return this._htmlDP.toView( html );
    }

    toData( viewFragment ) {
        const html = this._htmlDP.toData( viewFragment );
        return html2twig( html );
    }

    registerRawContentMatcher( pattern ) {
        this._htmlDP.registerRawContentMatcher( pattern );
    }
}

function twig2html( content ) {
    // Avoid parsing .raw-html-embed content: see https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html
    // We cannot use <div class="raw-html-embed"> in a twig template, as it's not possible to parse it.
    // We use a custom <raw-html-embed> tag instead
    content = content.replace( /<raw-html-embed>((?:(?!<\/raw-html-embed>).)*)<\/raw-html-embed>/gs, ( match, blockContent ) => '<raw-html-embed>' + utf8ToB64( blockContent ) + '</raw-html-embed>' );
    content = content.replace( /<code-language-twig>((?:(?!<\/code-language-twig>).)*)<\/code-language-twig>/gs, ( match, blockContent ) => '<code-language-twig>' + utf8ToB64( blockContent ) + '</code-language-twig>' );

    // Encode attributes containing {{ }}
    content = content.replace( /="((?:(?!").)*{{-?\s*(?:(?:(?!\s*-?}}).)*)\s*-?}}(?:(?!").)*)"/gs, ( match, content ) => twigAttribute( content ) );

    // Comments: {# $1 #}
    content = content.replace( /{#-?\s*((?:(?!\s*-?}}).)*)\s*-?#}/gs, ( match, content ) => twigComment( content ) );

    // Expressions: {{ $1 }}
    content = content.replace( /{{-?\s*((?:(?!\s*-?}}).)*)\s*-?}}/gs, ( match, content ) => twigExpression( content ) );

    // Single-line block statement: {% block foobar content %}
    content = content.replace( /{%-?\s*block ((?:(?!%})\S)+)\s+((?:(?!\s*-?%}).)+)\s*-?%}/gs, ( match, blockName, blockContent ) => twigStatementOpen( `block ${ blockName } ${ blockContent }` ) + twigStatementClose() );

    // Parent statements: {% $1 %}$2{% end$1 %}
    const usedParentStatements = [ ...new Set( [ ...content.matchAll( /{%-?\s*end(?<tag>\w+)\s*-?%}/gs ) ].map( match => match.groups.tag ) ) ];
    usedParentStatements.forEach( tag => {
    // Beginning of statement : {% $1 foobar %}
        content = content.replace( new RegExp( `{%-?\\s*(${ tag }\\s+((?:(?!\\s*-?%}).)*))\\s*-?%}`, 'g' ), ( match, contents ) => twigStatementOpen( contents, true ) );

        // End of statements: {% end$1 %}
        content = content.replace( new RegExp( `{%-?\\s*end${ tag }\\s*-?%}`, 'gs' ), () => twigStatementClose( true ) );
    } );

    // All other statements: {% $1 %}
    content = content.replace( /{%-?\s*((?:(?!\s*-?%}).)*)\s*-?%}/g, ( match, contents ) => twigStatementOpen( contents ) + twigStatementClose() );

    // Transform images with src attribute containing {{ }}
    content = transformImagesSrc( content );

    // Decode the previously encoded raw html blocks and replace <raw-html-embed> by <div>
    content = content.replace( /<raw-html-embed>((?:(?!<\/raw-html-embed>).)*)<\/raw-html-embed>/gs, ( match, blockContent ) => '<div class="raw-html-embed">' + b64ToUtf8( blockContent ) + '</div>' );
    content = content.replace( /<code-language-twig>((?:(?!<\/code-language-twig>).)*)<\/code-language-twig>/gs, ( match, blockContent ) => '<pre><code class="language-html">' + htmlEncode( b64ToUtf8( blockContent ) ) + '</code></pre>' );

    // TODO here we can find "else" parts by parsing the dom ("if" and "for")

    function twigStatementOpen( statement, withContent ) {
        statement = statement.trim();

        const elContainer = document.createElement( 'section' );
        elContainer.className = 'twig-statement-container';

        if ( withContent ) {
            elContainer.className += ' twig-statement-with-content';
        }

        const elStatement = document.createElement( 'div' );
        elStatement.className = 'twig-statement';
        elStatement.innerText = statement;

        // Adds some informations regarding the statement
        let matches;

        // Function: foo(bar)
        matches = [ ...statement.matchAll( /^(?<name>[\w_]+)\((?<args>.*)\)\s*$/g ) ];
        if ( matches.length > 0 ) {
            elStatement.className += ' twig-statement-function';
            elStatement.setAttribute( 'data-function', matches[ 0 ].groups.name );
            elStatement.setAttribute( 'data-args', matches[ 0 ].groups.args || '' );
        }

        // Tag: foo bar
        matches = [ ...statement.matchAll( /^(?<name>[\w_]+)\s*(?<args>.*)\s*$/g ) ];
        if ( matches.length > 0 ) {
            elStatement.className += ' twig-statement-tag';
            elStatement.setAttribute( 'data-tag', matches[ 0 ].groups.name );
            elStatement.setAttribute( 'data-args', matches[ 0 ].groups.args || '' );
        }

        elContainer.append( elStatement );

        if ( withContent ) {
            const elContent = document.createElement( 'div' );
            elContent.className = 'twig-statement-content';
            elContainer.append( elContent );
        }

        return elContainer.outerHTML.replace( twigStatementClose( withContent ), '' );
    }

    function twigStatementClose( withContent ) {
        if ( withContent ) {
            return '</div></section>';
        }
        return '</section>';
    }

    function twigExpression( content ) {
        content = content.trim();

        const el = document.createElement( 'span' );
        el.className = 'twig-expression';
        el.innerText = content;

        return el.outerHTML;
    }

    function twigAttribute( content ) {
        return `="${ encodeURIComponent( content ) }"`;
    }

    function twigComment( content ) {
        content = content.trim();

        const containerEl = document.createElement( 'section' );
        containerEl.className = 'twig-comment-container';

        const el = document.createElement( 'div' );
        el.className = 'twig-comment';
        el.innerText = content;

        containerEl.append( el );
        return containerEl.outerHTML;
    }

    function transformImagesSrc( content ) {
        if ( content.indexOf( 'src="' ) < 0 ) {
            return content;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString( content, 'text/html' );

        // The attribute has been encoded by the twigAttribute function
        const encodedExpr = encodeURIComponent( '{{' );
        Array.from( doc.querySelectorAll( `img[src*="${ encodedExpr }"]` ) ).forEach( el => {
            el.setAttribute( 'src', srcToSvgSrc( decodeURIComponent( el.getAttribute( 'src' ) ) ) );
        } );
        return doc.body.innerHTML;
    }

    return content;
}

function html2twig( content ) {
    const parser = new DOMParser();
    const doc = parser.parseFromString( content, 'text/html' );

    // html-embed divs
    Array.from( doc.getElementsByClassName( 'raw-html-embed' ) ).forEach( el => {
        const newEl = document.createElement( 'raw-html-embed' );
        newEl.innerHTML = el.innerHTML;
        el.outerHTML = newEl.outerHTML;
    } );

    // Comments: {# $1 #}
    Array.from( doc.getElementsByClassName( 'twig-comment-container' ) ).forEach( el => {
        const commentEl = Array.from( el.children ).filter( child => child.classList.contains( 'twig-comment' ) )[ 0 ];
        if ( !commentEl ) {
            return;
        }
        const newEl = document.createElement( 'twig-string' );
        newEl.textContent = `{# ${ commentEl.textContent.trim() } #}`;
        el.parentNode.replaceChild( newEl, el );
    } );

    // Expressions: {{ $1 }}
    Array.from( doc.getElementsByClassName( 'twig-expression' ) ).forEach( el => {
        const newEl = document.createElement( 'twig-string' );
        newEl.textContent = `{{ ${ el.textContent.trim() } }}`;
        el.parentNode.replaceChild( newEl, el );
    } );

    // Statements: {% $1 %}
    while ( doc.getElementsByClassName( 'twig-statement-container' ).length ) {
        const el = doc.getElementsByClassName( 'twig-statement-container' )[ 0 ];

        ( function( el ) {
            const parentEl = el.parentNode;
            const statementEl = Array.from( el.children ).filter( child => child.classList.contains( 'twig-statement' ) )[ 0 ];
            if ( !statementEl ) {
                return;
            }

            const statement = statementEl.textContent.trim();
            const content = Array.from( el.children ).filter( child => child.classList.contains( 'twig-statement-content' ) )[ 0 ];
            if ( !content ) {
                const openStatementEl = document.createElement( 'twig-string' );
                openStatementEl.textContent = `{% ${ statement } %}`;
                parentEl.replaceChild( openStatementEl, el );
                return;
            }

            const tagArr = statement.match( /^\s*(\w+)/ );
            const tag = tagArr ? tagArr[ 0 ] : '';
            const contentEl = document.createElement( 'div' );
            contentEl.innerHTML = '<!--TEMP_PLACEHOLDER-->';
            parentEl.replaceChild( contentEl, el );
            parentEl.innerHTML = parentEl.innerHTML.replace( '<div><!--TEMP_PLACEHOLDER--></div>', `<twig-string>{% ${ statement } %}</twig-string>${ content.innerHTML }<twig-string>{% end${ tag } %}</twig-string>` );
        }( el ) );
    }

    // Images with twig src
    Array.from( doc.querySelectorAll( `img[src^="${ svgSrcPrefix }"]` ) ).forEach( el => {
        const src = svgSrcToSrc( el.getAttribute( 'src' ) );
        if ( src ) {
            el.setAttribute( 'src', src );
        }
    } );

    content = doc.body.innerHTML;

    // We use custom tags in order to unescape twig strings
    content = content.replace( /<twig-string>((?:(?!<\/twig-string>).)*)<\/twig-string>/gs, ( match, blockContent ) => htmlDecode( blockContent ) );
    content = content.replace( /<pre>\s*<code class="language-twig">((?:(?!<\/code>\s*<\/pre>).)*)<\/code>\s*<\/pre>/gs, ( match, blockContent ) => '<code-language-twig>' + htmlDecode( blockContent ) + '</code-language-twig>' );

    return content;
}
