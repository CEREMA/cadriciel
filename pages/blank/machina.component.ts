import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CadricielService } from 'cadriciel/service/cadriciel.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-machina',
  templateUrl: './machina.component.html',
  styleUrls: ['./machina.component.scss'],
})
export class MachinaComponent {
  constructor(private cadriciel: CadricielService) {}
  ngOnInit() {}
  ngOnDestroy() {}
}
