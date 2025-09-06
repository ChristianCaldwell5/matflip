import { TestBed } from '@angular/core/testing';

import { MechanicService } from './mechanic.service';

describe('MechanicService', () => {
  let service: MechanicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MechanicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
