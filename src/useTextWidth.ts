const useTextWidth = () => {
  const canvas = document.createElement('canvas');

  const getCanvasFont = (element = document.body) => window.getComputedStyle(element).font;

  return {
    getTextWidth: (text: string, font?: string) => {
      const ctx = canvas.getContext('2d');
      ctx.font = font ?? getCanvasFont();
      const metrics = ctx.measureText(text);
      return Math.ceil(metrics.width);
    },

    getCanvasFont,
  };
};

export default useTextWidth;
