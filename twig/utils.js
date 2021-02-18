export const disableRichTextFor = ( schema, name ) => {
	// Disallow all attributes
	schema.addAttributeCheck( context => {
		if ( context.endsWith( `${ name } $text` ) ) {
			return false;
		}
	} );

	// Disallow soft breaks added by pressing SHIFT + ENTER
	schema.addChildCheck( ( context, childDefinition ) => {
		if ( context.endsWith( name ) && childDefinition.name === 'softBreak' ) {
			return false;
		}
	} );
};
