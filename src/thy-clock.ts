import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property } from "lit/decorators.js";

interface Numeral {
  [key: number]: number | string;
}

@customElement('thy-clock')
export class ThyClock extends LitElement {
  @property({ type: Number }) size = 250;
  @property({ type: String, attribute: "dial-color", reflect: true }) dialColor = '#000000';
  @property({ type: String, attribute: "dial-background-color", reflect: true }) dialBackgroundColor = '#FFFFFF';
  @property({ type: String, attribute: "second-hand-color", reflect: true }) secondHandColor = '#F3A829';
  @property({ type: String, attribute: "minute-hand-color", reflect: true }) minuteHandColor = '#222222';
  @property({ type: String, attribute: "hour-hand-color", reflect: true }) hourHandColor = '#222222';
  @property({ type: String, attribute: "alarm-hand-color", reflect: true }) alarmHandColor = '#FFFFFF';
  @property({ type: String, attribute: "alarm-hand-tip-color", reflect: true }) alarmHandTipColor = '#026729';
  @property({ type: Boolean, attribute: "hide-numerals", reflect: true }) hideNumerals = false;
  @property({ type: String, attribute: "numeral-font", reflect: true }) numeralFont = 'arial';
  @property({ type: String, attribute: "brand-font", reflect: true }) brandFont = 'arial';
  @property({ type: String, attribute: "brand-text", reflect: true }) brandText?: string;
  @property({ type: String, attribute: "brand-text2", reflect: true }) brandText2?: string;
  @property({ type: Boolean, attribute: "ticking-minutes", reflect: true }) tickingMinutes = false;
  @property({ type: Boolean, attribute: "sweeping-seconds", reflect: true }) sweepingSeconds = false;
  @property({ type: String }) numerals = JSON.stringify([{ 1: 1 }, { 2: 2 }, { 3: 3 }, { 4: 4 }, { 5: 5 }, { 6: 6 }, { 7: 7 }, { 8: 8 }, { 9: 9 }, { 10: 10 }, { 11: 11 }, { 12: 12 }]);
  @property({ type: String, attribute: "alarm-time", reflect: true }) alarmTime?: string;
  @property({ type: String, attribute: "time-offset-operator", reflect: true }) timeOffsetOperator = "+";
  @property({ type: Number, attribute: "time-offset-hours", reflect: true }) timeOffsetHours = 0;
  @property({ type: Number, attribute: "time-offset-minutes", reflect: true }) timeOffsetMinutes = 0;

  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private radius = 0;
  private alarmTriggered = 0;

  static styles = css`
    :host {
      display: block;
    }
    canvas {
      display: block;
    }
  `;

  firstUpdated() {
    this.canvas = this.shadowRoot?.querySelector('canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.radius = this.size / 2;
    this.ctx.translate(this.radius, this.radius);
    this.startClock();
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('size')) {
      this.canvas!.width = this.size;
      this.canvas!.height = this.size;
      this.radius = this.size / 2;
      this.ctx?.translate(this.radius, this.radius);
    }
  }

  render() {
    this.numerals = this.numerals ? JSON.parse(this.numerals) : [];
    return html`<canvas width="${this.size}" height="${this.size}"></canvas>`;
  }

  private toRadians(deg: number): number {
    return (Math.PI / 180) * deg;
  }

  private drawDial(color: string, bgcolor: string) {
    
    const dialRadius = this.size / 2 - this.size / 50;
    const dialBackRadius = this.size / 2 - this.size / 400;
    this.ctx!.beginPath();
    this.ctx!.arc(0, 0, dialBackRadius, 0, 360, false);
    this.ctx!.fillStyle = bgcolor;
    this.ctx!.fill();

    for (let i = 1; i <= 60; i++) {
      
      const ang = Math.PI / 30 * i;
      const sang = Math.sin(ang);
      const cang = Math.cos(ang);
      let sx=0, sy=0, ex=0, ey=0, nx=0, ny=0;

      if (i % 5 === 0) {
        this.ctx!.lineWidth = Math.floor(this.size / 75);
        sx = sang * Math.floor((dialRadius - dialRadius / 10));
        sy = cang * Math.floor(-(dialRadius - dialRadius / 10));
        ex = sang * Math.floor(dialRadius);
        ey = cang * Math.floor(-dialRadius);
        nx = sang * Math.floor((dialRadius - dialRadius / 4.2));
        ny = cang * Math.floor(-(dialRadius - dialRadius / 4.2));

        const marker = Math.floor(i / 5);
        const textSize = this.size / 14;
        this.ctx!.font = `100 ${textSize}px ${this.numeralFont}`;
        this.ctx!.fillStyle = color;

        const correctY = textSize/3;

        if (!this.hideNumerals && this.numerals.length > 0) {
          (this.numerals as unknown as Array<Numeral>).forEach((numeral: any) => {
            if (marker.toString() === Object.keys(numeral)[0]) {
              const textWidth = this.ctx!.measureText(numeral[marker]).width;
              this.ctx!.fillText(numeral[marker], nx - textWidth / 2, ny + correctY);
            }
          });
        }
      } else {
        this.ctx!.lineWidth = this.size / 100;
        sx = sang * (dialRadius - dialRadius / 20);
        sy = cang * -(dialRadius - dialRadius / 20);
        ex = sang * dialRadius;
        ey = cang * -dialRadius;
      }

      this.ctx!.beginPath();
      this.ctx!.strokeStyle = color;
      this.ctx!.lineCap = 'round';
      this.ctx!.moveTo(sx, sy);
      this.ctx!.lineTo(ex, ey);
      this.ctx!.stroke();
    }

    if (this.brandText) {
      this.ctx!.font = `100 ${this.size / 28}px ${this.brandFont}`;
      const brandtextWidth = this.ctx!.measureText(this.brandText).width;
      this.ctx!.fillText(this.brandText, -(brandtextWidth / 2), this.size / 6);
    }

    if (this.brandText2) {
      this.ctx!.font = `100 ${this.size / 44}px ${this.brandFont}`;
      const brandtextWidth2 = this.ctx!.measureText(this.brandText2).width;
      this.ctx!.fillText(this.brandText2, -(brandtextWidth2 / 2), this.size / 5);
    }
  }

  private drawHand(length: number) {
    this.ctx!.beginPath();
    this.ctx!.moveTo(0, 0);
    this.ctx!.lineTo(0, -length);
    this.ctx!.stroke();
  }

  private drawSecondHand(milliseconds: number, seconds: number, color: string) {
    const shlength = this.radius - this.size / 40;
    this.ctx!.save();
    this.ctx!.lineWidth = this.size / 150;
    this.ctx!.lineCap = 'round';
    this.ctx!.strokeStyle = color;
    const ms = this.sweepingSeconds ? milliseconds : 0;
    this.ctx!.rotate(this.toRadians((ms * 0.006) + (seconds * 6)));
    this.ctx!.shadowColor = 'rgba(0,0,0,.5)';
    this.ctx!.shadowBlur = this.size / 80;
    this.ctx!.shadowOffsetX = this.size / 200;
    this.ctx!.shadowOffsetY = this.size / 200;
    this.drawHand(shlength);

    // Tail of second hand
    this.ctx!.beginPath();
    this.ctx!.moveTo(0, 0);
    this.ctx!.lineTo(0, shlength / 15);
    this.ctx!.lineWidth = this.size / 30;
    this.ctx!.stroke();

    // Round center
    this.ctx!.beginPath();
    this.ctx!.arc(0, 0, this.size / 30, 0, 360, false);
    this.ctx!.fillStyle = color;
    this.ctx!.fill();
    this.ctx!.restore();
  }

  private drawMinuteHand(minutes: number, color: string) {
    const mhlength = this.size / 2.2;
    this.ctx!.save();
    this.ctx!.lineWidth = this.size / 50;
    this.ctx!.lineCap = 'round';
    this.ctx!.strokeStyle = color;
    if (this.tickingMinutes) {
      minutes = Math.floor(minutes);
    }
    this.ctx!.rotate(this.toRadians(minutes * 6));
    this.ctx!.shadowColor = 'rgba(0,0,0,.5)';
    this.ctx!.shadowBlur = this.size / 50;
    this.ctx!.shadowOffsetX = this.size / 250;
    this.ctx!.shadowOffsetY = this.size / 250;
    this.drawHand(mhlength);
    this.ctx!.restore();
  }

  private drawHourHand(hours: number, color: string) {
    const hhlength = this.size / 3;
    this.ctx!.save();
    this.ctx!.lineWidth = this.size / 25;
    this.ctx!.lineCap = 'round';

    this.ctx!.strokeStyle = color;
    this.ctx!.rotate(this.toRadians(hours * 30));
    this.ctx!.shadowColor = 'rgba(0,0,0,.5)';
    this.ctx!.shadowBlur = this.size / 50;
    this.ctx!.shadowOffsetX = this.size / 300;
    this.ctx!.shadowOffsetY = this.size / 300;
    this.drawHand(hhlength);
    this.ctx!.restore();
  }

  private twelveBased(hour: number): number {
    if (hour >= 12) {
      hour -= 12;
    }
    return hour;
  }

  private timeToDecimal(time: Date): number {
    const hours = this.twelveBased(time.getHours());
    const minutes = time.getMinutes();
    return hours + minutes / 60;
  }

  private drawAlarmHand(alarm: Date, color: string, tipcolor: string) {
    const ahlength = this.size / 2.4;
    const alarmDecimal = this.timeToDecimal(alarm);
    this.ctx!.save();
    this.ctx!.lineWidth = this.size / 30;
    this.ctx!.lineCap = 'butt';
    this.ctx!.strokeStyle = color;
    this.ctx!.rotate(this.toRadians(alarmDecimal * 30));
    this.ctx!.shadowColor = 'rgba(0,0,0,.5)';
    this.ctx!.shadowBlur = this.size / 55;
    this.ctx!.shadowOffsetX = this.size / 300;
    this.ctx!.shadowOffsetY = this.size / 300;

    // Main alarm hand
    this.ctx!.beginPath();
    this.ctx!.moveTo(0, 0);
    this.ctx!.lineTo(0, -ahlength + this.size / 10);
    this.ctx!.stroke();

    // Tip of the alarm hand
    this.ctx!.beginPath();
    this.ctx!.strokeStyle = tipcolor;
    this.ctx!.moveTo(0, -ahlength + this.size / 10);
    this.ctx!.lineTo(0, -ahlength);
    this.ctx!.stroke();

    // Round center
    this.ctx!.beginPath();
    this.ctx!.arc(0, 0, this.size / 24, 0, 360, false);
    this.ctx!.fillStyle = color;
    this.ctx!.fill();
    this.ctx!.restore();
  }

  private checkAlarmTime(newTime: string | Date): Date {
    if (newTime instanceof Date) {
      return newTime;
    }
    const timeParts = newTime.split(':').map(part => parseInt(part, 10));
    const date = new Date();
    date.setHours(timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0);
    return date;
  }

  private last: any = 0;

  private startClock() {
    this.timeOffsetHours = isNaN(this.timeOffsetHours) ? 0 : this.timeOffsetHours;
    this.timeOffsetMinutes = isNaN(this.timeOffsetMinutes) ? 0 : this.timeOffsetMinutes;
    
    const updateClock = () => {
      const now = new Date();
      if (this.timeOffsetOperator !== "+") {
        now.setHours(now.getHours() - this.timeOffsetHours);
        now.setMinutes(now.getMinutes() - this.timeOffsetMinutes);
      } else {
        now.setHours(now.getHours() + this.timeOffsetHours);
        now.setMinutes(now.getMinutes() + this.timeOffsetMinutes);
      }

      const milliseconds = now.getMilliseconds();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes() + seconds / 60;
      const hours = this.twelveBased(now.getHours() + minutes / 60);

      this.ctx!.clearRect(-this.radius, -this.radius, this.size, this.size);
      this.drawDial(this.dialColor, this.dialBackgroundColor);

      if (this.alarmTime) {
        const alarmTime = new Date(this.checkAlarmTime(this.alarmTime));
        this.drawAlarmHand(alarmTime, this.alarmHandColor, this.alarmHandTipColor);
      }
      this.drawHourHand(hours, this.hourHandColor);
      this.drawMinuteHand(minutes, this.minuteHandColor);
      this.drawSecondHand(milliseconds, seconds, this.secondHandColor);

      // EVERY SECOND
      if (!this.last || (now as any - this.last) >= 1000) {
        this.last = now;
        this.dispatchEvent(new CustomEvent('onEverySecond', { bubbles: true, composed: true, detail: { date: now, seconds: now.getSeconds() } }));
      }

      if (this.alarmTime) {
        const alarmDate = new Date(this.checkAlarmTime(this.alarmTime));
        const nowInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const alarmInSeconds = alarmDate.getHours() * 3600 + alarmDate.getMinutes() * 60 + alarmDate.getSeconds();
        if (nowInSeconds >= alarmInSeconds) {
          this.alarmTriggered += 1;
        }
        if (this.alarmTriggered <= 1 && this.alarmTriggered !== 0) {
          this.dispatchEvent(new CustomEvent('onAlarm', { bubbles: true, composed: true, detail: { date: now } }));
        }
      }

      requestAnimationFrame(updateClock);
    };

    updateClock();
  }
}
