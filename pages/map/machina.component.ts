import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import L, {
  Map,
  geoJSON,
  GeoJSON,
  latLng,
  tileLayer,
  Layer,
  Icon,
  Marker,
} from 'leaflet';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, LeafletModule],
  selector: 'app-machina',
  templateUrl: './machina.component.html',
  styleUrls: ['./machina.component.scss'],
})
export class MachinaComponent implements OnInit, AfterViewInit, OnDestroy {
  private routeSub: Subscription | undefined;
  public paramId: string | null = null;

  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors',
      }),
    ],
    zoom: 6,
    center: latLng(46.227638, 2.213749),
  };

  private map!: Map;
  private geoJsonLayer: GeoJSON | null = null;

  constructor(private route: ActivatedRoute) {
    console.log('MachinaComponent initialisé.');
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe((params: Params) => {
      this.paramId = params['id'] || null;
      this.initWithParams(params);
    });
  }

  private initWithParams(params: Params): void {
    if (this.paramId) {
      console.log(`Initialisation avec l'ID: ${this.paramId}`);
      // Ici, vous pourriez charger des données GeoJSON spécifiques basées sur l'ID
      // Par exemple :
      // this.loadGeoJsonData(this.paramId);
    }
  }

  private createPopupContent(properties: any): string {
    let content = '<div>';
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        content += `<strong>${key}:</strong> ${properties[key]}<br>`;
      }
    }
    content += '</div>';
    return content;
  }

  private convertToGeoJSON(geoshape: any): any {
    if (geoshape.type && geoshape.coordinates) {
      return {
        type: 'Feature',
        geometry: {
          type: geoshape.type,
          coordinates: geoshape.coordinates,
        },
        properties: {},
      };
    }
    console.error('Format geoshape invalide', geoshape);
    return null;
  }

  addGeoJson(geojsonData: any) {
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }

    const geojsonOptions = {
      style: (feature: any) => ({
        color: '#3388ff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5,
      }),
      onEachFeature: (feature: any, layer: Layer) => {
        if (feature.properties) {
          layer.bindPopup(this.createPopupContent(feature.properties));
        }

        layer.on({
          mouseover: (e: any) => {
            const layer = e.target;
            layer.setStyle({
              weight: 4,
              opacity: 1.0,
              fillOpacity: 0.7,
            });
          },
          mouseout: (e: any) => {
            if (this.geoJsonLayer) {
              this.geoJsonLayer.resetStyle(e.target);
            }
          },
          click: (e: any) => {
            this.map.fitBounds(e.target.getBounds());
          },
        });
      },
    };

    this.geoJsonLayer = geoJSON(geojsonData, geojsonOptions).addTo(this.map);
    this.map.fitBounds(this.geoJsonLayer.getBounds());
  }

  onMapReady(map: Map) {
    this.map = map;
    const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
    const iconUrl = 'assets/images/marker-icon.png';
    const shadowUrl = 'assets/images/marker-shadow.png';

    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }
  }
}
