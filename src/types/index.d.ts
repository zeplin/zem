export enum BlurType {
  GAUSSIAN = "gaussian",
  BACKGROUND = "background",
}

export interface Blur {
  readonly type: BlurType;
  readonly radius: number;
}

export enum BorderPosition {
  CENTER = "center",
  INSIDE = "inside",
  OUTSIDE = "outside",
}

export interface Border {
  readonly position: BorderPosition;
  readonly thickness: number;
  readonly fill: Fill;
}

export interface Color {
  // blendAll(colors: Color): Color;
  readonly name: string;
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
  equals(color: Color): boolean;
  blend(color: Color): Color;
  toHex(color: Color): HexColor;
  toHsl(color: Color): HslColor;
}

export interface ColorStop {
  readonly color: Color;
  readonly position: number;
}

export interface Component {
  readonly name: string;
  readonly description: string;
}

export interface Context {
  readonly project?: Project;
  readonly styleguide?: Styleguide;
  getOption(name: string): number | boolean | string;
}

export interface Extension {
  layer?(context: Context, selectedLayer: Layer): string | CodeObject;
  screen?(context: Context, selectedVerion: Version, selectedScreen: Screen): string | CodeObject;
  component?(context: Context, selectedVerion: Version, selectedComponent: Component): string | CodeObject;
  colors?(context: Context, colors: readonly Color[]): string | CodeObject;
  textStyles?(context: Context, textStyles: readonly TextStyle[]): string | CodeObject;
  exportColors?(context: Context, colors: readonly Color[]): CodeExportObject | readonly CodeExportObject[];
  exportTextStyles?(
    context: Context,
    textStyles: readonly TextStyle[],
  ): CodeExportObject | readonly CodeExportObject[];
  styleguideColors?(context: Context, colors: readonly Color[]): string | CodeObject; // DEPRECATED
  styleguideTextStyles?(context: Context, textStyles: readonly TextStyle[]): string | CodeObject; // DEPRECATED
  comment?(context: Context, test: string): string; // DEPRECATED
  exportStyleguideColors?(context: Context, colors: readonly Color[]): CodeExportObject | readonly CodeExportObject[]; // DEPRECATED
  exportStyleguideTextStyles?(
    context: Context,
    textStyles: readonly TextStyle[],
  ): CodeExportObject | readonly CodeExportObject[]; // DEPRECATED
}

export enum FillType {
  COLOR = "color",
  GRADIENT = "gradient",
}

export enum BlendMode {
  NORMAL = "normal",
  DARKEN = "darken",
  MULTIPLY = "multiply",
  COLOR_BURN = "color-burn",
  LIGHTEN = "lighten",
  SCREEN = "screen",
  COLOR_DODGE = "color-dodge",
  OVERLAY = "overlay",
  SOFT_LIGHT = "soft-light",
  HARD_LIGHT = "hard-light",
  DIFFERENCE = "difference",
  EXCLUSION = "exclusion",
  HUE = "hue",
  SATURATION = "saturation",
  COLOR = "color",
  LUMINOSITY = "luminosity",
  SOURCE_IN = "source-in",
  SOURCE_OUT = "source-out",
  SOURCE_ATOP = "source-atop",
  DESTINATION_OVER = "destination-over",
  DESTINATION_IN = "destination-in",
  DESTINATION_OUT = "destination-out",
  DESTINATION_ATOP = "destination-atop",
  DISSOLVE = "dissolve",
  LINEAR_BURN = "linear-burn",
  LINEAR_DODGE = "linear-dodge",
  DARKER_COLOR = "darker-color",
  LIGHTER_COLOR = "lighter-color",
  VIVID_LIGHT = "vivid-light",
  LINEAR_LIGHT = "linear-light",
  PIN_LIGHT = "pin-light",
  HARD_MIX = "hard-mix",
  SUBTRACT = "subtract",
  DIVIDE = "divide",
}

export interface Fill {
  readonly type: FillType;
  readonly color: Color;
  readonly gradient: Gradient;
  readonly opacity: number;
  readonly blendMode: BlendMode;
  readonly fill: number;
}

export enum GradientType {
  LINEAR = "linear",
  RADIAL = "radial",
  ANGULAR = "angular",
}

export interface Gradient {
  readonly type: GradientType;
  readonly andle: number;
  readonly scale: number;
  readonly colorStops: readonly ColorStop[];
}

export enum LayerType {
  TEXT = "text",
  SHAPE = "shape",
  GROUP = "group",
}

export interface Range {
  readonly start: number;
  readonly end: number;
}

export interface TextStyleReference {
  readonly range: Range;
  readonly textStyle: TextStyle;
}

export interface Layer {
  readonly type: LayerType;
  readonly name: string;
  readonly rect: Rect;
  readonly fills: readonly Fill[];
  readonly borders: readonly Border[];
  readonly shadows: readonly Shadow[];
  readonly blur: Blur;
  readonly opacity: number;
  readonly blendMode: BlendMode;
  readonly borderRadius: number;
  readonly location: number;
  readonly exportable: boolean;
  readonly assets: readonly Asset[];
  readonly parent: Layer;
  readonly version: Version;
  readonly content: string;
  readonly textStyles: readonly TextStyleReference[];
  readonly layers: readonly Layer[];
  readonly componentName: string;
}

export enum Platforms {
  WEB = "web",
  ANDROID = "android",
  IOS = "ios",
  OSX = "osx",
}

export enum LengthUnit {
  PX = "px",
  PT = "pt",
}

export enum TextLengthUnit {
  DP = "dp",
}

export interface BaseProject {
  readonly type: Platforms;
  readonly name: string;
  readonly textStyles: readonly TextStyle[];
  readonly colors: readonly Color[];
  readonly density: string;
  readonly densityDivisor: number;
  readonly lengthUnit: LengthUnit;
  readonly textLengthUnit: TextLengthUnit;
}

export interface Project extends BaseProject {
  readonly linkedStyleguide?: Styleguide;
  findTextStyleByName(name: string, useLinkedStyleguides?: boolean): TextStyle;
  findTextStyleEqual(textStyle: TextStyle, useLinkedStyleguides?: boolean): TextStyle;
  findColorByName(name: string, useLinkedStyleguides?: boolean): Color;
  findColorEqual(color: Color, useLinkedStyleguides?: boolean): Color;
  findColorByHexAndAlpha(values: ColorValues, useLinkedStyleguides?: boolean): Color;
}

export interface Styleguide extends BaseProject {
  readonly parent?: Styleguide;
  findTextStyleByName(name: string, useParentStyleguides?: boolean): TextStyle;
  findTextStyleEqual(textStyle: TextStyle, useParentStyleguides?: boolean): TextStyle;
  findColorByName(name: string, useParentStyleguides?: boolean): Color;
  findColorEqual(color: Color, useParentStyleguides?: boolean): Color;
  findColorByHexAndAlpha(values: ColorValues, useParentStyleguides?: boolean): Color;
}

export interface ColorValues {
  readonly hex: string;
  readonly alpha: number;
}

export interface Screen {
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
}

export enum ShadowType {
  OUTER = "outer",
  INNER = "inner",
}

export interface Shadow {
  readonly type: ShadowType;
  readonly offsetX: string;
  readonly offsetY: string;
  readonly blurRadius: number;
  readonly spread: number;
  readonly color: Color;
}

export interface TextStyle {
  readonly name: string;
  readonly fontFace: string;
  readonly fontSize: number;
  readonly fontWeight: number;
  readonly fontStyle: string;
  readonly fontFamily: string;
  readonly fontStretch: string;
  readonly lineHeight: number;
  readonly textAlign: string;
  readonly letterSpacing: number;
  readonly color: Color;
  readonly weightText: string;
  euqals(t: TextStyle): boolean;
}

export enum Source {
  SKETCH = "sketch",
  XD = "xd",
  FIGMA = "figma",
  PSD = "psd",
  BITMAP = "bitmap",
}

export enum DestinationType {
  SCREEN = "screen",
  PREVIOUS = "previous",
}

export interface Destination {
  readonly name: string;
  readonly type: DestinationType;
}

export interface Link {
  readonly rect: Rect;
  readonly destination: Destination;
}

export interface GridVertical {
  readonly gutterWidth: number;
  readonly columnWidth: number;
  readonly numberOfCols: number;
  readonly guttersOnOutside: boolean;
}

export interface GridHorizontal {
  readonly gutterHeight: number;
  readonly rowHeight: number;
}

export interface Grid {
  readonly horizontalOffset: number;
  readonly vertical: GridVertical;
  readonly horizontal: GridHorizontal;
}

export interface Version {
  readonly source: Source;
  readonly mage: Image;
  readonly backgroundColor: Color;
  readonly layers: readonly Layer[];
  readonly links: readonly Link[];
  readonly grid: Grid;
  readonly componentNames: readonly string[];
}

export interface Image {
  readonly url: string;
  readonly width: number;
  readonly height: number;
}

export interface Asset {
  readonly density: string;
  readonly format: string;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface HexColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}
export interface HslColor {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export interface CodeObject {
  readonly code: string;
  readonly language: string;
}

export interface CodeExportObject {
  readonly code: string;
  readonly language: string;
  readonly filename: string;
}