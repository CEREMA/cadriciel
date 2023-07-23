import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-lookup-input',
  templateUrl: './lookup-input.component.html',
  styleUrls: ['./lookup-input.component.scss'],
})
export class LookupInputComponent implements OnInit {
  constructor() {}

  @Input() options: any = {
    title: '-',
    visible: false,
    items: [],
    sortByField: null,
    selected: [],
  };
  @Output() select = new EventEmitter<Object>();

  title: string = '-';
  cols: any[] = [];
  items: any[] = [];

  selectedGrid: Object = {};
  selected2Grid: Object = {};

  selected: any[] = [];

  sortByField(array: any[], field: string) {
    return array.sort((a, b) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  addSelected(field: string, o: any) {
    let item;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i][field] === o[field]) {
        item = this.items[i];
        this.items.splice(i, 1);
        break;
      }
    }

    if (item) {
      this.selected.push(item);
    }
  }

  // Function to remove an item from the selected array and add it back to the content array
  removeSelected(field: string, o: any) {
    let item;
    for (let i = 0; i < this.selected.length; i++) {
      if (this.selected[i][field] === o[field]) {
        item = this.selected[i];
        this.selected.splice(i, 1);
        break;
      }
    }

    if (item) {
      this.items.push(item);
      if (this.options.sortByField)
        this.sortByField(this.items, this.options.sortByField);
    }
  }

  gridSelected(o: any) {
    this.selectedGrid = o;
  }

  grid2Selected(o: any) {
    this.selected2Grid = o;
  }

  addItem() {
    console.log(this.selectedGrid);
    this.addSelected('id', this.selectedGrid);
    this.select.emit(this.selected);
  }

  removeItem() {
    console.log(this.selected2Grid);
    this.removeSelected('id', this.selected2Grid);
    this.select.emit(this.selected);
  }

  load() {
    if (this.options.items.length == 0) return;
    if (this.options.cols) {
      for (let i = 0; i < this.options.cols.length; i++) {
        if (this.options.cols[i] !== null) this.cols.push(this.options.cols[i]);
      }
    } else this.cols = Object.keys(this.options.items[0]);
    this.items = this.options.items;
    this.selected = this.options.selected;
    if (this.options.sortByField)
      this.sortByField(this.items, this.options.sortByField);
    this.options.visible = true;
    this.title = this.options.title;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.load();
  }

  ngOnInit(): void {}
}
