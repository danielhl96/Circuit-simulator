import { Component, Input, ViewChild } from '@angular/core';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexAxisChartSeries, ApexXAxis, ApexYAxis } from 'ng-apexcharts';

@Component({
  selector: 'app-characteristic-curves',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './characteristic-curves.component.html',
  styleUrl: './characteristic-curves.component.css'
})
export class CharacteristicCurvesComponent {
  @ViewChild('chart') chart!: ChartComponent;

  // Einheiten-Inputs
  @Input() xUnit: string = 'V';
  @Input() yUnit: string = 'µA';

  // Spannungswerte für x-Achse (in V)
  private _xCategories: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // Stromwerte für y-Achse (in A, werden intern zu Mikroampere umgerechnet)
  private _rawCurrentA: number[] = [0.000001, 0.000002, 0.000003, 0.000004, 0.000005, 0.000006, 0.000007, 0.000008, 0.000009, 0.00001];

  private toDisplayUnit(values: number[]): number[] {
    if (this.yUnit === 'µA') return values.map(v => parseFloat((v * 1e6).toFixed(4)));
    if (this.yUnit === 'mA') return values.map(v => parseFloat((v * 1e3).toFixed(4)));
    return values; // A
  }

  updateCharacteristicCurve(currentA: number[], voltages?: number[]): void {
    this._rawCurrentA = currentA;
    if (voltages) this._xCategories = voltages;

    this.chart.updateOptions({
      xaxis: this.buildXAxis(),
      yaxis: this.buildYAxis(),
    });
    this.chart.updateSeries([{
      name: `I (${this.yUnit})`,
      data: this.toDisplayUnit(this._rawCurrentA)
    }]);
  }

  private buildXAxis(): ApexXAxis {
    return {
      categories: this._xCategories,
      title: {
        text: `Spannung (${this.xUnit})`,
        style: { fontSize: '13px' }
      },
      labels: {
        formatter: (val: string) => `${val} ${this.xUnit}`
      }
    };
  }

  private buildYAxis(): ApexYAxis {
    return {
      title: {
        text: `Stromstärke (${this.yUnit})`,
        style: { fontSize: '13px' }
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(2)} ${this.yUnit}`
      }
    };
  }

  chartOptions: ApexChart = {
    type: 'line',
    height: 320,
    toolbar: { show: false }
  };

  series: ApexAxisChartSeries = [{
    name: `I (mA)`,
    data: this.toDisplayUnit(this._rawCurrentA)
  }];

  title = {
    text: '',
    align: 'left' as const,
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  @Input()
  set headline(value: string) {
    this.title.text = value;
  }

  // Setzt Stromwerte in Ampere, zeigt sie in mA an
  @Input()
  set seriesData(values: number[]) {
    console.log('Setting series data:', values);
    this._rawCurrentA = values;
    this.series = [{
      name: `I (${this.yUnit})`,
      data: this.toDisplayUnit(values)
    }];
  }

  // Setzt Spannungswerte für x-Achse
  @Input()
  set xCategories(values: number[]) {
    this._xCategories = values;
    this.xaxis = this.buildXAxis();
  }

  stroke = {
    curve: 'smooth' as const,
    width: 3
  };

  markers = { size: 0 };

  xaxis: ApexXAxis = this.buildXAxis();
  yaxis: ApexYAxis = this.buildYAxis();
}
