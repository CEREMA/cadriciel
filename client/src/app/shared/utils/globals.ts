import { Injectable } from '@angular/core';

interface UpdateDiff {
  id: number;
  from: { [key: string]: any };
  to: { [key: string]: any };
}
interface DiffResult {
  create: any[];
  update: UpdateDiff[];
  delete: any[];
}
@Injectable()
export class VariablesGlobales {
  ID_SET: number = 0;
}

export const findIdByPropertyValue = (
  objects: any,
  key: string,
  value: any
) => {
  for (let i = 0; i < objects.length; i++) {
    if (objects[i][key] === value) {
      return objects[i].id;
    }
  }
  return null;
};

export const findObjectByPropertyValue = (
  objects: any,
  key: string,
  value: any
) => objects.find((obj: any) => obj[key] === value);

export const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const compareArrays = (original: any[], updated: any[]) => {
  let result: DiffResult = { create: [], update: [], delete: [] };

  let originalMap = new Map(original.map((item) => [item.id, item]));
  let updatedMap = new Map(updated.map((item) => [item.id, item]));

  // Trouver les éléments créés
  result.create = updated
    .filter((item) => !originalMap.has(item.id))
    .map(({ id, ...rest }) => rest);

  // Trouver les éléments supprimés
  result.delete = original.filter((item) => !updatedMap.has(item.id));

  // Trouver les éléments mis à jour
  for (let [id, updatedItem] of updatedMap.entries()) {
    let originalItem = originalMap.get(id);
    if (originalItem) {
      let diffFrom: { [key: string]: any } = {};
      let diffTo: { [key: string]: any } = {};

      for (let key in updatedItem) {
        if (updatedItem[key] !== originalItem[key]) {
          diffFrom[key] = originalItem[key];
          diffTo[key] = updatedItem[key];
        }
      }

      // Si des différences ont été trouvées, ajoutez-les à l'array de mise à jour
      if (Object.keys(diffFrom).length > 0) {
        result.update.push({
          id: id,
          from: diffFrom,
          to: diffTo,
        });
      }
    }
  }

  return result;
};
