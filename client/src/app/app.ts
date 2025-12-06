import { HttpClient, httpResource } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('client');
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/';
  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap((response) => {
        console.log(response);
      })
    );
  }
  data = toSignal(this.getData());
}
