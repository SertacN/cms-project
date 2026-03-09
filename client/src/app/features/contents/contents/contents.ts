import { Component, Input, signal, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-contents',
  imports: [],
  templateUrl: './contents.html',
  styleUrl: './contents.css',
})
export class Contents {
  // Eğer app.config.ts içinde withComponentInputBinding() varsa:
  @Input() categoryId?: string;
  // Servis inject edin
  // private contentsService = inject(ContentsService);

  isLoading = signal(false);
  contents = signal<any[]>([]);

  // Input değiştiğinde (yani URL'deki ID değiştiğinde) tetiklenir
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      this.fetchContents(this.categoryId);
    }
  }

  fetchContents(id: string) {
    this.isLoading.set(true);
    console.log(id, 'numaralı kategori için istek atılıyor...');

    // Örnek servis çağrısı:
    /*
    this.contentsService.getByCategoryId(id).subscribe({
      next: (res) => {
        this.contents.set(res.data);
        this.isLoading.set(false);
      }
    });
    */

    // Simülasyon
    setTimeout(() => this.isLoading.set(false), 500);
  }
}
