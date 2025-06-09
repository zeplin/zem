import {
    CodeExportObject,
    CodeObject,
    Component,
    Context,
    Extension,
    Layer,
    Screen,
    Version,
} from '@zeplin/extension-model';

/**
 * Implement functions you want to work with, see documentation for details:
 * https://zeplin.github.io/extension-model/
 */
const extension: Extension = {
    colors(context: Context): CodeObject {
        throw new Error('Not implemented yet.');
    },

    comment(context: Context, text: string): string {
        throw new Error('Not implemented yet.');
    },

    component(context: Context, selectedVersion: Version, selectedComponent: Component): CodeObject {
        throw new Error('Not implemented yet.');
    },

    exportColors(context: Context): CodeExportObject | CodeExportObject[] {
        throw new Error('Not implemented yet.');
    },

    exportSpacing(context: Context): CodeExportObject | CodeExportObject[] {
        throw new Error('Not implemented yet.');
    },

    exportTextStyles(context: Context): CodeExportObject | CodeExportObject[] {
        throw new Error('Not implemented yet.');
    },

    layer(context: Context, selectedLayer: Layer): CodeObject {
        throw new Error('Not implemented yet.');
    },

    screen(context: Context, selectedVersion: Version, selectedScreen: Screen): CodeObject {
        throw new Error('Not implemented yet.');
    },

    spacing(context: Context): CodeObject {
        throw new Error('Not implemented yet.');
    },

    textStyles(context: Context): CodeObject {
        throw new Error('Not implemented yet.');
    }
};

export default extension;
