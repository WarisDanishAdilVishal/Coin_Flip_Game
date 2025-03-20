import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Show the loader
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Hide the loader
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Wrap an observable with loading indicators
   * @param obs The observable to wrap
   * @returns The wrapped observable
   */
  wrapObservable<T>(obs: Observable<T>): Observable<T> {
    this.show();
    return obs.pipe(
      finalize(() => this.hide())
    );
  }
} 