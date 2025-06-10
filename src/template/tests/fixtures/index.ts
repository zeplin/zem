import {
    Component,
    ComponentData,
    ComponentVariant,
    ComponentVariantData,
    Context,
    ContextData,
    Screen,
    ScreenData,
    Version,
    VersionData,
} from '@zeplin/extension-model';

import project from './project.json';
import screensData from './screens.json';
import componentsData from './components.json';
import componentVariantsData from './componentVariants.json';
import versionData from './version.json';
import pkg from '../../package.json';

const defaultOptions = pkg.zeplin.options?.reduce((options: ContextData['options'], option: {
    id: string;
    default: string;
}) => {
    options[option.id] = option.default;
    return options;
}, {} as ContextData['options']);

const singleComponents = componentsData.map((data: ComponentData) => new Component(data));
const variantComponents = componentVariantsData.map((data: ComponentVariantData) => new ComponentVariant(data)).reduce(
    (cs: Component[], variant: ComponentVariant) => cs.concat(variant.components!), [] as Component[],
);

export const context = new Context({ project, options: defaultOptions });
export const version = new Version(versionData as VersionData);
export const screens = screensData.map((data: ScreenData) => new Screen(data));
export const components = singleComponents.concat(variantComponents);
