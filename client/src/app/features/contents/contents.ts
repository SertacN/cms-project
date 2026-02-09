import { Component, inject } from '@angular/core';
import { ContentsService } from '../../core/services/contents/contents.service';
import { CategoriesResponse } from '../../core/services/contents/interfaces/category.dto';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-contents',
  imports: [],
  templateUrl: './contents.html',
  styleUrl: './contents.css',
})
export class Contents {
  private readonly contentsService = inject(ContentsService);
  categories = toSignal<CategoriesResponse>(this.contentsService.getAllCategories());
}
