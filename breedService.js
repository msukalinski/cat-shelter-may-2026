import { v4 } from "uuid";
import catBreeds from "./breeds.js";

export function readBreeds() {
    return catBreeds;
}

export function addBreed(breedName) {
    const newBreed = {
        id: v4(),
        name: breedName,
    };

    catBreeds.push(newBreed);
};

export function getBreedById(breedId) {
    return catBreeds.find(breed => breed.id === breedId);
}