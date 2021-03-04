import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { add } from '@ckeditor/ckeditor5-utils/src/translation-service';

export const variablesTypes = [ 'object', 'array', 'string', 'boolean', 'bool', 'integer', 'int', 'float', 'datetime', 'unknown' ];

export default class DisplayTwigVariablesUI extends Plugin {
	init() {
		add( 'en', {
			'twig.variables.name': 'Name',
			'twig.variables.type': 'Type',
			'twig.variables.label': 'Label',
			'twig.variables.type.object': 'Object',
			'twig.variables.type.array': 'Array',
			'twig.variables.type.string': 'String',
			'twig.variables.type.boolean': 'Boolean',
			'twig.variables.type.integer': 'Integer',
			'twig.variables.type.float': 'Float',
			'twig.variables.type.datetime': 'Datetime',
			'twig.variables.type.unknown': 'Unknown'
		} );

		add( 'fr', {
			'twig.variables.name': 'Nom',
			'twig.variables.type': 'Type',
			'twig.variables.label': 'Description',
			'twig.variables.type.object': 'Objet',
			'twig.variables.type.array': 'Tableau',
			'twig.variables.type.string': 'Chaîne',
			'twig.variables.type.boolean': 'Booléen',
			'twig.variables.type.integer': 'Nombre entier',
			'twig.variables.type.float': 'Nombre à virgule',
			'twig.variables.type.datetime': 'Date et heure',
			'twig.variables.type.unknown': 'Inconnu'
		} );
	}
}

