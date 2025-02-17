import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
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

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, LeafletModule],
  selector: 'app-machina',
  templateUrl: './machina.component.html',
  styleUrls: ['./machina.component.scss'],
})
export class MachinaComponent implements AfterViewInit {
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }),
    ],
    zoom: 6, // Niveau de zoom pour voir la France entière
    center: latLng(46.227638, 2.213749), // Centre de la France
  };

  private map!: Map;
  private geoJsonLayer: GeoJSON;

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
    // Si un layer existe déjà, on le retire
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }

    // Options de style pour le GeoJSON
    const geojsonOptions = {
      style: (feature: any) => ({
        color: '#3388ff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5,
      }),
      onEachFeature: (feature: any, layer: Layer) => {
        // Popup si propriétés présentes
        if (feature.properties) {
          layer.bindPopup(this.createPopupContent(feature.properties));
        }

        // Événements au survol
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
            this.geoJsonLayer.resetStyle(e.target);
          },
          click: (e: any) => {
            this.map.fitBounds(e.target.getBounds());
          },
        });
      },
    };

    // Création du layer GeoJSON
    this.geoJsonLayer = geoJSON(geojsonData, geojsonOptions).addTo(this.map);

    // Zoom sur l'étendue du GeoJSON
    this.map.fitBounds(this.geoJsonLayer.getBounds());
  }

  onMapReady(map: Map) {
    this.map = map;
    // Configuration du chemin des icônes
    const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
    const iconUrl = 'assets/images/marker-icon.png';
    const shadowUrl = 'assets/images/marker-shadow.png';

    // Configuration par défaut pour les icônes
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
    // Permettre au DOM de se mettre à jour
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  ngOnInit() {}

  constructor() {
    console.log('MachinaComponent initialisé.');
  }
}
