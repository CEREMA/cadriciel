export function removeNewId(arr: Array<any>) {
  for (let i in arr) {
    if (arr[i]) {
      if (Array.isArray(arr[i])) removeNewId(arr[i]);
      if (arr[i].id) {
        if (arr[i].id * 1 < 0) delete arr[i].id;
      }
    }
  }
  return arr;
}

export function shadeColor(hex: string, percent: number): string {
  // convert hex color code to RGB values
  let r = parseInt(hex.trim().slice(1, 3), 16);
  let g = parseInt(hex.trim().slice(3, 5), 16);
  let b = parseInt(hex.trim().slice(5, 7), 16);

  // calculate shade percentage
  let factor = percent / 100;

  // shade the color by applying the factor to each RGB value
  r = Math.round(r * (1 - factor));
  g = Math.round(g * (1 - factor));
  b = Math.round(b * (1 - factor));

  // convert shaded RGB values back to hex color code
  let shadedHex = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');

  return shadedHex;
}
