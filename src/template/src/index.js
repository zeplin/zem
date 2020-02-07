/**
 * Export functions you want to work with, see documentation for details:
 * https://github.com/zeplin/zeplin-extension-documentation
 */

function layer(context, selectedLayer) {

}

function screen(context, selectedVersion, selectedScreen) {

}

function component(context, selectedVersion, selectedComponent) {

}

function colors(context) {

}

function textStyles(context) {

}

function exportColors(context) {

}

function exportTextStyles(context) {

}

/**
 * The following functions will be deprecated. Your extensions can export them to support old versions of Zeplin's macOS app.
 * See Zeplin Extensions migration guide for details:
 * https://zpl.io/shared-styleguides-extensions-migration-guide
 */

function styleguideColors(context, colors) {

}

function styleguideTextStyles(context, textStyles) {

}

function exportStyleguideColors(context, colors) {

}

function exportStyleguideTextStyles(context, textStyles) {

}

function comment(context, text) {

}

export default {
    layer,
    screen,
    component,
    colors,
    textStyles,
    exportColors,
    exportTextStyles,
    styleguideColors,
    styleguideTextStyles,
    exportStyleguideColors,
    exportStyleguideTextStyles,
    comment
};
