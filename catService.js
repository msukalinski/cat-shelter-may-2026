import cats from "./cats.js";
import { v4 } from "uuid";
import { getBreedById } from "./breedService.js";

export function readCats() {
    return cats;
}

export function addCat(catData) {
    const breedName = getBreedById(catData.breed)?.name || 'Unknown Breed';
    const newCat = {
        id: v4(),
        ...catData,
        breed: breedName
    };

    cats.push(newCat);
}