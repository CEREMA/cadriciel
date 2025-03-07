import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CadricielService } from 'cadriciel/service/cadriciel.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-machina',
  templateUrl: './machina.component.html',
  styleUrls: ['./machina.component.scss'],
})
export class MachinaComponent implements OnInit, OnDestroy {
  private routeSub: Subscription | undefined;
  public paramId: string | null = null;

  constructor(
    private cadriciel: CadricielService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialisation avec récupération des paramètres
    this.routeSub = this.route.params.subscribe((params: Params) => {
      this.paramId = params['id'] || null;
      this.init(params);
    });
  }

  // Méthode générique pour gérer les paramètres
  private init(params: Params): void {
   
  }

  ngOnDestroy(): void {
    // Nettoyage de la souscription pour éviter les memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
