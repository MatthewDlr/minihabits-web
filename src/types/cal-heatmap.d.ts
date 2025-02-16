declare module "cal-heatmap" {
  export default class CalHeatmap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paint(options: any, plugins?: any[]): void;
    destroy(): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fill(options: any): void;
  }
}

declare module "cal-heatmap/plugins/Tooltip" {}
declare module "cal-heatmap/plugins/CalendarLabel" {}
