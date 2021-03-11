import Command from '@ckeditor/ckeditor5-core/src/command';
import Swal from 'sweetalert2';

export const variablesTypes = [ 'object', 'array', 'string', 'boolean', 'bool', 'integer', 'int', 'float', 'datetime', 'unknown' ];

export class DisplayTwigVariablesCommand extends Command {
	execute() {
		const t = this.editor.t;
		const variables = this.editor.config.get( 'twig.variables' );

		this.editor.model.change( () => {
			Swal.fire( {
				title: t( 'twig.variables' ),
				width: '80%',
				html: this._createVariablesHtmlOutput( variables ),
				footer: 'Twig documentation:&nbsp;<a href="https://twig.symfony.com/doc/3.x/" target="_blank">https://twig.symfony.com<a>'
			} );
		} );
	}

	refresh() {
		this.isEnabled = true;
	}

	_createVariablesHtmlOutput( vars ) {
		const t = this.editor.t;

		if ( typeof vars !== 'object' || vars === null ) {
			return;
		}

		const tableEl = document.createElement( 'table' );
		tableEl.className = 'twig-variables';
		const theadEl = document.createElement( 'thead' );

		const headTrEl = document.createElement( 'tr' );
		headTrEl.append(
			textElement( 'th', t( 'twig.variables.name' ) ),
			textElement( 'th', t( 'twig.variables.type' ) ),
			textElement( 'th', t( 'twig.variables.label' ) )
		);
		theadEl.append( headTrEl );
		tableEl.append( theadEl );

		const lines = Object.entries( vars ).map( ( [ name, conf ] ) => this._createVariableDomOutput( name, conf ) );
		tableEl.append( ...lines );

		return tableEl.outerHTML;
	}

	_createVariableDomOutput( name, conf ) {
		const tbody = document.createElement( 'tbody' );
		const tr = document.createElement( 'tr' );

		// Name
		tr.append( textElement( 'th', name ) );

		// Type
		const cleanType = this._cleanType( conf.type );
		tr.append( textElement( 'td', this._typeLabel( conf ) ) );

		// Label
		const labelEl = document.createElement( 'td' );
		if ( conf.label ) {
			labelEl.append( textElement( 'p', conf.label ) );
		}
		const exampleEl = this._usageExample( name, conf );
		if ( exampleEl ) {
			labelEl.append( exampleEl );
		}
		tr.append( labelEl );

		// Add the line
		tbody.append( tr );

		const createChildrenTr = objConf => {
			const childrenTr = document.createElement( 'tr' );
			if ( !objConf.properties || !Object.keys( objConf.properties ).length ) {
				return childrenTr;
			}

			childrenTr.append( textElement( 'td', '' ) );
			const childrenTd = document.createElement( 'td' );
			childrenTd.colSpan = 2;
			childrenTd.innerHTML = this._createVariablesHtmlOutput( objConf.properties );
			childrenTr.append( childrenTd );

			return childrenTr;
		};

		if ( cleanType === 'object' && typeof conf.properties === 'object' && Object.keys( conf.properties ).length > 0 ) {
			Object.keys( conf.properties ).forEach( key => {
				// Add parent name to objects for examples
				conf.properties[ key ].parentName = ( conf.parentName || '' ) + name + '.';
			} );

			tbody.append( createChildrenTr( conf ) );
		}

		if ( cleanType === 'array' && conf.children && conf.children.type === 'object' ) {
			Object.keys( conf.children.properties || {} ).forEach( key => {
				// Add parent name to objects for examples
				conf.children.properties[ key ].parentName = arrayItemName( name ) + '.';
			} );

			tbody.append( createChildrenTr( conf.children ) );
		}

		return tbody;
	}

	_typeLabel( conf ) {
		const t = this.editor.t;

		const cleanType = this._cleanType( conf.type );
		let typeLabel = t( cleanType );

		// Array
		if ( cleanType === 'array' && conf.children && conf.children.type !== undefined ) {
			const childrenType = this._typeLabel( conf.children );
			typeLabel += ` <${ childrenType }>`;
		}

		// Custom type
		if ( cleanType === 'unknown' && conf.type && conf.type !== 'unknown' ) {
			typeLabel += ` (${ conf.type })`;
		}

		// Nullable
		if ( conf.nullable ) {
			typeLabel += ' | null';
		}

		return typeLabel;
	}

	_cleanType( type ) {
		if ( !type || !variablesTypes.includes( type ) ) {
			return 'unknown';
		}

		if ( type === 'int' ) {
			return 'integer';
		}

		if ( type === 'bool' ) {
			return 'boolean';
		}

		return type;
	}

	_singleLineUsageExample( name, type ) {
		switch ( type ) {
			case 'string':
				return `{{ ${ name } }}`;
			case 'integer':
				return `{{ ${ name } }}`;
			case 'float':
				return `{{ ${ name }|number_format(2) }}`;
			case 'datetime':
				return `{{ ${ name }|format_date }}`;
			case 'boolean':
				return `{{ ${ name } ? 'yes' : 'no' }}`;
			case 'array':
				return `{% for ${ arrayItemName( name ) } in ${ name } %} ... {% endfor %}`;
			case 'object':
				return `{{ ${ name }.foo }}`;
			default:
				return '...';
		}
	}

	_usageExample( name, conf ) {
		const originalName = name;
		name = ( conf.parentName || '' ) + name;

		const type = this._cleanType( conf.type );
		const linkEl = document.createElement( 'a' );
		const preEl = document.createElement( 'pre' );
		const codeEl = document.createElement( 'code' );
		codeEl.className = 'twig';

		preEl.append( codeEl );

		switch ( type ) {
			case 'string':
				codeEl.innerText = `
{{ ${ name } }}
{{ ${ name }|upper }}
`;
				break;
			case 'integer':
			case 'float':
				linkEl.href = 'https://twig.symfony.com/doc/3.x/filters/number_format.html';
				codeEl.innerText = `
{{ ${ name } }}
{{ ${ name }|number_format(2) }}
`;
				break;
			case 'datetime':
				linkEl.href = 'https://twig.symfony.com/doc/3.x/filters/format_datetime.html';
				codeEl.innerText = `
{{ ${ name }|format_date }}
{{ ${ name }|format_datetime }}
{{ ${ name }||format_datetime('short', 'none', locale='fr') }}
`;
				break;
			case 'boolean':
				codeEl.innerText = `
{{ ${ name } ? 'yes' : 'no' }}
{% if ${ name } %} yes {% else %} no {% endif %}
`;
				break;
			case 'array': {
				const childExample = this._singleLineUsageExample( `${ arrayItemName( originalName ) }`, this._cleanType( conf.children.type ) );

				linkEl.href = 'https://twig.symfony.com/doc/3.x/tags/for.html';
				codeEl.innerText = `
Total: {{ ${ name }|length }}

{% for ${ arrayItemName( originalName ) } in ${ name } %}
    ${ childExample }
{% else %}
    There is no ${ name }
{% endfor %}
`;
				break;
			}
			case 'object':
				codeEl.innerText = '';
				break;
			default:
		}

		const output = document.createElement( 'div' );
		output.className = 'twig-variables-example';

		if ( codeEl.innerText ) {
			output.append( preEl );
		}

		if ( linkEl.href ) {
			linkEl.target = '_blank';
			linkEl.innerText = linkEl.href;
			output.append( linkEl );
		}

		return output;
	}
}

function arrayItemName( name ) {
	if ( name.slice( -3 ) === 'ies' && name.length > 3 ) {
		return name.slice( 0, -3 ) + 'y';
	}
	if ( name.slice( -1 ) === 's' && name.length > 1 ) {
		return name.slice( 0, -1 );
	}

	return `${ name }Item`;
}

function textElement( tagName, text ) {
	const el = document.createElement( tagName );
	el.innerText = text;
	return el;
}
