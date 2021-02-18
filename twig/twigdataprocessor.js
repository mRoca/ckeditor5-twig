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
	// Expressions: {{ $1 }}
	content = content.replace( /{{-?\s*((?:(?!}}).)*)\s*-?}}/gs, ( match, content ) => {
		// Any {{ }} content
		return twigExpression( content );
	} );

	// Parent statements: {% $1 %}$2{% end$1 %}
	// TODO Deal with nested tags
	// TODO Deal with "else" ("if" and "for")
	const parentTags = [ 'if', 'for', 'block' ];
	parentTags.forEach( tag => {
		const reg = new RegExp( `{%-?\\s*(?<statement>${ tag }\\s+(?<condition>(?:(?!%}).)*))\\s*-?%}(?<content>(?:(?!{%\\s*end${ tag }\\s*%}).)*){%-?\\s*end${ tag }\\s*-?%}`, 'gs' );

		while ( content.match( reg ) ) {
			content = content.replace( reg, ( match, ...args ) => {
				const groups = args.pop();
				return twigStatement( groups.statement, groups.content );
			} );
		}
	} );

	// Statements: {% $1 %}
	content = content.replace( /{%-?\s*((?:(?!%}).)*)\s*-?%}/gs, ( match, contents ) => {
		// Any {% %} content
		return twigStatement( contents );
	} );

	// TODO here we can find "else" parts by parsing the dom

	function twigStatement( statement, content ) {
		statement = statement.trim();
		content = ( content || '' ).trim();

		const elContainer = document.createElement( 'section' );
		elContainer.className = 'twig-statement-container';

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

		if ( content ) {
			const elContent = document.createElement( 'div' );
			elContent.className = 'twig-statement-content';
			elContent.innerHTML = content;
			elContainer.append( elContent );
		}

		return elContainer.outerHTML;
	}

	function twigExpression( content ) {
		content = content.trim();

		const el = document.createElement( 'span' );
		el.className = 'twig-expression';
		el.innerText = content;

		return el.outerHTML;
	}

	return content;
}

function html2twig( content ) {
	return content;
}
