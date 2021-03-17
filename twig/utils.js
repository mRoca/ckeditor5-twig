export function disableRichTextFor( schema, name ) {
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
}

/**
 * Do the same as @ckeditor/ckeditor5-utils/src/translation-service::add, but without overriding the value.
 *
 * @param {number} language
 * @param {Object<String, any>} translations
 * @param {function|undefined} getPluralForm
 */
export function addTranslationsIfNotExist( language, translations, getPluralForm ) {
    if ( !window.CKEDITOR_TRANSLATIONS[ language ] ) {
        window.CKEDITOR_TRANSLATIONS[ language ] = {};
    }

    const languageTranslations = window.CKEDITOR_TRANSLATIONS[ language ];
    languageTranslations.dictionary = languageTranslations.dictionary || {};
    languageTranslations.getPluralForm = getPluralForm || languageTranslations.getPluralForm;

    Object.keys( translations ).forEach( key => {
        if ( languageTranslations.dictionary[ key ] ) {
            return;
        }
        languageTranslations.dictionary[ key ] = translations[ key ];
    } );
}
