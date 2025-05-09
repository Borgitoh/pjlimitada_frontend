import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodykitsComponent } from './bodykits.component';

describe('BodykitsComponent', () => {
  let component: BodykitsComponent;
  let fixture: ComponentFixture<BodykitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BodykitsComponent]
    });
    fixture = TestBed.createComponent(BodykitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
