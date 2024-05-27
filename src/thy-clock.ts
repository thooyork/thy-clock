import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

const DEFAULT_SIZE = 200;

@customElement('thy-clock')
export class ThyClock extends LitElement {

  @property({ type: Number })
  size = DEFAULT_SIZE;

  @property({ type: String, attribute: 'dial-color' })
  dialColor = '#333333';

  @property({ type: String, attribute: 'dial-background-color' })
  dialBackgroundColor = '#FFFFFF';

  @property({ type: String, attribute: 'second-hand-color' })
  secondHandColor = '#F3A829';

  @property({ type: String, attribute: 'minute-hand-color' })
  minuteHandColor = '#222222';

  @property({ type: String, attribute: 'hour-hand-color' })
  hourHandColor = '#222222';

  @property({ type: Boolean, attribute: 'hide-numerals' })
  hideNumerals = false;

  @property({ type: String, attribute: 'numeral-font' })
  numeralFont = 'Arial';

  @property({ type: String, attribute: 'brand-font' })
  brandFont = 'Arial';

  @property({ type: String, attribute: 'brand-text' })
  brandText = "";

  @property({ type: String, attribute: 'brand-text2' })
  brandText2 = "";

  @property({ type: Array })
  numerals = [
    { 1: 1 },
    { 2: 2 },
    { 3: 3 },
    { 4: 4 },
    { 5: 5 },
    { 6: 6 },
    { 7: 7 },
    { 8: 8 },
    { 9: 9 },
    { 10: 10 },
    { 11: 11 },
    { 12: 12 }
  ];

  private elCanvas: HTMLCanvasElement | null = null;

  constructor() {
    super();
    this.updateComplete.then(() => {
      this.init();
    })
  }

  render() {
    return html`
      <div class="clockWrapper" style="width: ${this.size}px">
      <div class="cnvsWrapper">
        <canvas id="cnvs" class="cnvs" width="${this.size}" height="${this.size}"></canvas>
      </div>
      </div>
      `;
  }

  private init() {
    this.elCanvas = this.renderRoot.querySelector('#cnvs');
    if (this.elCanvas) {
      const ctx = this.elCanvas.getContext('2d');
      if (ctx) {
        ctx.translate(this.size / 2, this.size / 2);
        this.drawDial(ctx);
      }
    }
  }


  private toRadians(deg: number) {
    return (Math.PI / 180) * deg;
  }

  private drawDial(ctx: CanvasRenderingContext2D) {
    if (ctx) {
      const dialRadius = this.size / 2 - (this.size / 50);
      const dialBackRadius = this.size / 2 - (this.size / 400);

      let sx, sy, ex, ey;

      ctx.beginPath();
      ctx.arc(0, 0, dialBackRadius, 0, 360, false);
      ctx.fillStyle = this.dialBackgroundColor;
      ctx.fill();

      for (let i = 1; i <= 60; i += 1) {
        const ang = Math.PI / 30 * i;
        const sang = Math.sin(ang);
        const cang = Math.cos(ang);
        //hour marker/numeral
        if (i % 5 === 0) {
          ctx.lineWidth = this.size / 50;
          sx = sang * (dialRadius - dialRadius / 9);
          sy = cang * -(dialRadius - dialRadius / 9);
          ex = sang * dialRadius;
          ey = cang * - dialRadius;
          const nx = sang * (dialRadius - dialRadius / 4.2);
          const ny = cang * -(dialRadius - dialRadius / 4.2);
          const marker = i / 5;

          ctx.textBaseline = 'middle';
          const textSize = this.size / 13;
          ctx.font = '100 ' + textSize + 'px ' + this.numeralFont;
          ctx.beginPath();
          ctx.fillStyle = this.dialColor;

          if (!this.hideNumerals && this.numerals.length > 0) {
            this.numerals.map(function (numeral: any) {
              if (marker.toString() === Object.keys(numeral)[0]) {
                const textWidth = ctx.measureText(numeral[marker]).width;
                ctx.fillText(numeral[marker], nx - (textWidth / 2), ny);
              }
            });
          }
          //minute marker
        } else {
          ctx.lineWidth = this.size / 100, 10;
          sx = sang * (dialRadius - dialRadius / 20);
          sy = cang * -(dialRadius - dialRadius / 20);
          ex = sang * dialRadius;
          ey = cang * - dialRadius;
        }

        ctx.beginPath();
        ctx.strokeStyle = this.dialColor;
        ctx.lineCap = "round";
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      if (this.brandText) {
        ctx.font = `100 ${this.size / 28}px ${this.brandFont}`;
        const brandtextWidth = ctx.measureText(this.brandText).width;
        ctx.fillText(this.brandText, -(brandtextWidth / 2), (this.size / 6));
      }

      if (this.brandText2) {
        ctx.textBaseline = 'middle';
        ctx.font = `100 ${this.size / 44}px ${this.brandFont}`;
        const brandtextWidth2 = ctx.measureText(this.brandText2).width;
        ctx.fillText(this.brandText2, -(brandtextWidth2 / 2), (this.size / 5));
      }
    }
  }


  static styles = css`
    :host {
      display: block;
    }
    .clockWrapper {
      width: auto;
      height: auto;
      aspect-ratio: 1 / 1;
    }
    .cnvs {
      display: block;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'thy-clock': ThyClock
  }
}
