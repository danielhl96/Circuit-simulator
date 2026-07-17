import { Component,input,Input, ViewChild } from '@angular/core';
import { NgApexchartsModule,ChartComponent , ApexChart, ApexAxisChartSeries, ApexXAxis } from 'ng-apexcharts';

@Component({
  selector: 'app-characteristic-curves',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './characteristic-curves.component.html',
  styleUrl: './characteristic-curves.component.css'
})
export class CharacteristicCurvesComponent {
  @ViewChild('chart') chart!: ChartComponent;
 

 updateCharacteristicCurve(current: number[]) {
  console.log('Updating characteristic curve with current data:', current);
  this.chart.updateSeries([
    {
      name: 'I(U)',
      data: current
    }
  ]);
}

  chartOptions: ApexChart = {
    type: 'line',
    height: 320,
    toolbar: {
      show: false
    }
    
  };

  series: ApexAxisChartSeries = [
    {
      name: 'Current',
      data: [1, 2, 3, 4, 5, 6,7,8,9,10]
    }
  ];

   title = {
    text: '',
    align: 'left' as const,
    style: {
      fontSize: '18px',
      fontWeight: 'bold'
    }
  };

  @Input()
  set headline(value: string) {
    this.title.text = value;
  }

  stroke = {
    curve: 'smooth' as const,
    width: 3
  };

  markers = {
    size: 0
  };

  xaxis: ApexXAxis = {
    categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  };

 


}