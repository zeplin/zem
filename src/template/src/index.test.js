import extension from './index';
import { context, version, screens, components } from "./fixtures";

describe('index', () => {

  describe('Colors', () => {
    it('should generate code snippet', () => {
      const code = extension.colors(context);
      return expect(Promise.resolve(code)).resolves.not.toThrow();
    });

    it('should generate exportable file', () => {
      const code = extension.exportColors(context);
      return expect(Promise.resolve(code)).resolves.not.toThrow();
    });
  });


  describe('Text Styles', () => {
    it('should generate code snippet for text styles', () => {
      const code = extension.textStyles(context);
      return expect(Promise.resolve(code)).resolves.not.toThrow();
    });

    it('should generate exportable file text styles', () => {
      const code = extension.exportTextStyles(context);
      return expect(Promise.resolve(code)).resolves.not.toThrow();
    });
  });


  version.layers.map(layer => {
    describe(`Layer \`${layer.name}\``, () => {
      it('should generate code snippet', async () => {
        const code = extension.layer(context, layer, version);
        return expect(Promise.resolve(code)).resolves.not.toThrow();
      });
    });
  });

  screens.map(screen => {
    describe(`Screen \`${screen.name}\``, () => {
      it('should generate code snippet', async () => {
        const code = extension.screen(context, version, screen);
        return expect(Promise.resolve(code)).resolves.not.toThrow();
      });
    });
  });

  components.map(component => {
    describe(`Component \`${component.name}\``, () => {
      it('should generate code snippet', async () => {
        const code = extension.component(context, version, component);
        return expect(Promise.resolve(code)).resolves.not.toThrow();
      });
    });
  });


});