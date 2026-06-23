import catBreeds from "./breeds.js";

export function readBreeds() {
    return catBreeds;
}

export function addBreed(breedName) {
    const newBreed = {
        id: catBreeds.length + 1,
        name: breedName,
    };

    catBreeds.push(newBreed);
}