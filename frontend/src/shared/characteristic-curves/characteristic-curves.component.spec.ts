import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacteristicCurvesComponent } from './characteristic-curves.component';

describe('CharacteristicCurvesComponent', () => {
  let component: CharacteristicCurvesComponent;
  let fixture: ComponentFixture<CharacteristicCurvesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacteristicCurvesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacteristicCurvesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
