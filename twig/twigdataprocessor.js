import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

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

	function twigComment( content ) {
		content = content.trim();

		const el = document.createElement( 'div' );
		el.className = 'twig-comment';
		el.innerText = content;

		return el.outerHTML;
	}

	return content;
}

function html2twig( content ) {
	const parser = new DOMParser();
	const doc = parser.parseFromString( content, 'text/html' );

	// Comments: {# $1 #}
	Array.from( doc.getElementsByClassName( 'twig-comment' ) ).forEach( el => {
		el.parentNode.replaceChild( document.createTextNode( `{# ${ el.innerHTML } #}` ), el );
	} );

	// Expressions: {{ $1 }}
	Array.from( doc.getElementsByClassName( 'twig-expression' ) ).forEach( el => {
		el.parentNode.replaceChild( document.createTextNode( `{{ ${ el.innerHTML } }}` ), el );
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
				parentEl.replaceChild( document.createTextNode( `{% ${ statement } %}` ), el );
				return;
			}

			const tagArr = statement.match( /^\s*(\w+)/ );
			const tag = tagArr ? tagArr[ 0 ] : '';
			const contentEl = document.createElement( 'div' );
			contentEl.innerHTML = '<!--TEMP_PLACEHOLDER-->';
			parentEl.replaceChild( contentEl, el );
			parentEl.innerHTML = parentEl.innerHTML.replace( '<div><!--TEMP_PLACEHOLDER--></div>', `{% ${ statement } %}${ content.innerHTML }{% end${ tag } %}` );
		}( el ) );
	}

	return doc.body.innerHTML;
}
