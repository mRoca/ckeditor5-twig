import Command from '@ckeditor/ckeditor5-core/src/command';
import Swal from 'sweetalert2';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

export const variablesTypes = [ 'object', 'array', 'string', 'boolean', 'bool', 'integer', 'int', 'float', 'datetime', 'unknown' ];

export default class DisplayTwigVariablesCommand extends Command {
    execute() {
        const t = this.editor.t;
        const variables = this.editor.config.get( 'twig.variables' );

        this.editor.model.change( () => {
            Swal.fire( {
                title: t( 'twig.variables' ),
                width: '80%',
                showConfirmButton: false,
                showCloseButton: true,
                html: this._getTableElement( variables ),
                footer: 'Twig documentation:&nbsp;<a href="https://twig.symfony.com/doc/3.x/" target="_blank">https://twig.symfony.com<a>'
            } );
        } );
    }

    refresh() {
        this.isEnabled = true;
    }

    _getTableElement( vars ) {
        const hash = JSON.stringify( vars );

        if ( !this._cachedTables ) {
            this._cachedTables = {};
        }

        if ( !this._cachedTables[ hash ] ) {
            this._cachedTables[ hash ] = this._createVariablesTable( vars );
        }

        return this._cachedTables[ hash ];
    }

    _createVariablesTable( vars, parents = [] ) {
        const t = this.editor.t;

        if ( typeof vars !== 'object' || vars === null || Object.keys( vars ).length === 0 ) {
            const nothingEl = document.createElement( 'h3' );
            nothingEl.innerText = t( 'twig.variables.empty' );
            return nothingEl;
        }

        const tableEl = document.createElement( 'table' );
        tableEl.className = 'twig-variables';

        // If it's the main table, add the headers
        if ( !parents || !parents.length ) {
            const theadEl = document.createElement( 'thead' );
            const headTrEl = document.createElement( 'tr' );
            headTrEl.append(
                textElement( 'th', t( 'twig.variables.name' ) ),
                textElement( 'th', t( 'twig.variables.type' ) ),
                textElement( 'th', t( 'twig.variables.label' ) ),
                textElement( 'th', '' )
            );
            theadEl.append( headTrEl );
            tableEl.append( theadEl );
        }

        const lines = Object.entries( vars ).map( ( [ name, conf ] ) => this._createVariableDomOutput( name, conf ) );
        tableEl.append( ...lines );

        return tableEl;
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

        // Button
        const btnTdEl = document.createElement( 'td' );
        const btn = this._renderInsertButton( name, conf );
        if ( btn ) {
            btnTdEl.append( btn );
        }
        tr.append( btnTdEl );

        // Add the line
        tbody.append( tr );

        const createChildrenTr = ( objConf, parents = [] ) => {
            const childrenTr = document.createElement( 'tr' );
            if ( !objConf.properties || !Object.keys( objConf.properties ).length ) {
                return childrenTr;
            }

            const childrenTd = document.createElement( 'td' );
            childrenTd.colSpan = 4;
            childrenTd.append( this._createVariablesTable( objConf.properties, parents || [] ) );
            childrenTr.append( childrenTd );

            return childrenTr;
        };

        const childrenParents = [ ...( conf._parents || [] ), name ];
        if ( cleanType === 'object' && typeof conf.properties === 'object' && Object.keys( conf.properties ).length > 0 ) {
            Object.keys( conf.properties ).forEach( key => {
                // Add parent name to objects for examples
                conf.properties[ key ]._parentName = ( conf._parentName || '' ) + name + '.';
                // Build a parents array in order to know how deep we are
                conf.properties[ key ]._parents = childrenParents;
            } );

            tbody.append( createChildrenTr( conf, childrenParents ) );
        }

        if ( cleanType === 'array' && conf.children && conf.children.type === 'object' ) {
            Object.keys( conf.children.properties || {} ).forEach( key => {
                // Add parent name to objects for examples
                conf.children.properties[ key ]._parentName = arrayItemName( name ) + '.';
                // Build a parents array in order to know how deep we are
                conf.children.properties[ key ]._parents = childrenParents;
            } );

            tbody.append( createChildrenTr( conf.children, childrenParents ) );
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

    _renderInsertButton( name, conf ) {
        const editor = this.editor;
        const t = editor.t;

        const view = new ButtonView();
        const commandArgs = this._getCommandByType( ( conf._parentName || '' ) + name, conf );
        if ( !commandArgs || !commandArgs.length ) {
            return undefined;
        }

        const commandName = commandArgs.shift();

        view.set( {
            label: t( 'twig.variable.insert' ),
            tooltip: t( 'twig.variable.insert.tooltip' ),
            withText: true
        } );

        const command = editor.commands.get( commandName );
        view.bind( 'isEnabled' ).to( command, 'isEnabled' );
        view.on( 'execute', () => {
            editor.execute( commandName, ...commandArgs );
            editor.editing.view.focus();
            Swal.close();
        } );

        view.render();
        return view.element;
    }

    _getCommandByType( name, conf ) {
        switch ( conf.type ) {
        case 'string':
        case 'integer':
            return [ 'insertTwigExpression', name ];
        case 'float':
            return [ 'insertTwigExpression', `${ name } | number_format(2)` ];
        case 'datetime':
            return [ 'insertTwigExpression', `${ name } | format_date` ];
        case 'boolean':
            return [ 'insertTwigStatement', { statement: `if ${ name }`, withContent: true } ];
        case 'array':
            return [ 'insertTwigStatement', { statement: `for ${ arrayItemName( name ) } in ${ name }`, withContent: true } ];
        default:
            return [];
        }
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
        name = ( conf._parentName || '' ) + name;

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
`.trim();
            break;
        case 'integer':
        case 'float':
            linkEl.href = 'https://twig.symfony.com/doc/3.x/filters/number_format.html';
            codeEl.innerText = `
{{ ${ name } }}
{{ ${ name }|number_format(2) }}
`.trim();
            break;
        case 'datetime':
            linkEl.href = 'https://twig.symfony.com/doc/3.x/filters/format_datetime.html';
            codeEl.innerText = `
{{ ${ name }|format_date }}
{{ ${ name }|format_datetime }}
{{ ${ name }|format_datetime('short', 'none', locale='fr') }}
`.trim();
            break;
        case 'boolean':
            codeEl.innerText = `
{{ ${ name } ? 'yes' : 'no' }}
{% if ${ name } %} yes {% else %} no {% endif %}
`.trim();
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
`.trim();
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
