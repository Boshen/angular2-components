import {
  beforeEachProviders,
  describe,
  inject,
  it
} from '@angular/core/testing';
import { BaseRequestOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

// Load the implementations that should be tested
import { AppState } from '../app.service';
import { Home } from './home.component';

describe('Home', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEachProviders(() => [
    BaseRequestOptions,
    MockBackend,
    {
      provide: Http,
      useFactory: function(backend, defaultOptions) {
        return new Http(backend, defaultOptions);
      },
      deps: [MockBackend, BaseRequestOptions]
    },

    AppState,
    Home
  ]);

  it('should have default data', inject([ Home ], (home) => {
    expect(home.localState).toEqual({ value: '' });
  }));

});
