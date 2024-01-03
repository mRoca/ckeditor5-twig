const Encore = require( '@symfony/webpack-encore' );
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

// See https://symfony.com/doc/current/frontend/encore/installation.html

if ( !Encore.isRuntimeEnvironmentConfigured() ) {
    Encore.configureRuntimeEnvironment( process.env.NODE_ENV || 'dev' );
}

Encore
    .setOutputPath( 'public/build/' )
    .setPublicPath( '/build' )
    .addEntry( 'app', './assets/app.js' )
    .enableStimulusBridge( './assets/controllers.json' )
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps( !Encore.isProduction() )
    .enableVersioning( Encore.isProduction() )
    .configureBabel( config => {
        config.plugins.push( '@babel/plugin-transform-class-properties' );
    } )
    .configureBabelPresetEnv( config => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    } )

    // ===============
    // CKEditor5 Part
    .addPlugin( new CKEditorTranslationsPlugin( {
        addMainLanguageTranslationsToAllAssets: true,
        // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
        language: 'fr'
    } ) )

    // Use raw-loader for CKEditor 5 SVG files.
    .addRule( {
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
        loader: 'raw-loader'
    } )

    // Configure other image loaders to exclude CKEditor 5 SVG files.
    .configureLoaderRule( 'images', loader => {
        loader.exclude = /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/;
    } )

    // Configure PostCSS loader.
    .addLoader( {
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
        loader: 'postcss-loader',
        options: styles.getPostCssConfig( {
            themeImporter: {
                themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
            }
        } )
    } )
// ===============
;

module.exports = Encore.getWebpackConfig();
