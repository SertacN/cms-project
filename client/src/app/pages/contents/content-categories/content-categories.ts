import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentCategoriesService } from '../../../core/services/contents';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoriesResponse } from '../../../core/services/contents/interfaces';

@Component({
  selector: 'app-content-categories',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './content-categories.html',
  styleUrl: './content-categories.css',
})
export class ContentCategories {
  private readonly contentCategoriesService = inject(ContentCategoriesService);
  categories = toSignal<CategoriesResponse>(this.contentCategoriesService.getAllCategories());
}
