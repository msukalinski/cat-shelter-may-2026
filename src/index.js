import http from 'http';
import fs from 'fs/promises';
import { addCat, getCatById, readCats, editCat } from '../catService.js';
import { readBreeds, addBreed } from '../breedService.js';

const server = http.createServer(async (req, res) => {
    console.log(readBreeds());
    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        const bodyFormData = await readBodyFormData(req);

        addBreed(bodyFormData.get('breed'));

        // TO CHECK IF THERE IS A BREED THAT WE WANT TO ADD AND IF SO TO THROW NEW ERROR
        // addBreed(breedName);


        // REDIRECT TO HOME PAGE AFTER ADDING THE BREED
        return res.writeHead(302, { Location: '/' }).end();
    }

    if (req.method === 'POST' && req.url === '/cats/add-cat') {
        const bodyFormData = await readBodyFormData(req);

        const newCat = {
            name: bodyFormData.get('name'),
            description: bodyFormData.get('description'),
            imageUrl: bodyFormData.get('imageUrl'),
            breed: bodyFormData.get('breed'),
        };

        addCat(newCat);

        return res.writeHead(302, { Location: '/' }).end();
    }

    if (req.method === 'POST' && req.url.startsWith('/cats/edit-cat')) {
        const catId = req.url.split('/').pop();
        const editedCat = await readBodyFormData(req);

        editCat(catId, Object.fromEntries(editedCat.entries()));

        // OR
        // editCat(catId, {
        //     name: editedCat.get('name'),
        //     description: editedCat.get('description'),
        //     imageUrl: editedCat.get('imageUrl'),
        //     breed: editedCat.get('breed'),
        // })

        return res.writeHead(302, { Location: '/' }).end();
    }

    if (req.url.startsWith('/styles')) {
        const cssContent = await fs.readFile('./src/styles/site.css', 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(cssContent);
        return res.end();
    }

    if (req.url === '/js/script.js') {
        const jsContent = await fs.readFile('./src/js/script.js', 'utf-8');

        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(jsContent);
        return res.end();
    }

    let htmlContent = '';
    res.writeHead(200, { 'Content-Type': 'text/html' });

    if (req.url === '/') {
        htmlContent = await renderHomePage();
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('./src/views/addBreed.html', 'utf-8');
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await renderAddCatPage();
    } else if (req.url.startsWith('/cats/edit-cat')) {
        const catId = req.url.split('/').pop();
        htmlContent = await renderEditCatPage(catId);
    } else {
        htmlContent = await renderNotFoundPage();
    }

    res.write(htmlContent);
    res.end();
});

async function renderHomePage() {
    let htmlContent = await fs.readFile('./src/views/home/index.html', 'utf-8');

    const catTemplate = (cat) => `
        <li>
            <img src="${cat.imageUrl}" alt="${cat.name}">
            <h3>${cat.name}</h3>
            <p><span>Breed: </span>${cat.breed}</p>
            <p><span>Description: </span>${cat.description}</p>
            <ul class="buttons">
                <li class="btn edit"><a href="/cats/edit-cat/${cat.id}">Change Info</a></li>
                <li class="btn delete"><a href="">New Home</a></li>
            </ul>
        </li>`;

    const cats = readCats();
    const catsContent = `<ul>${cats.map(cat => catTemplate(cat)).join('\n')}</ul>`;

    const result = htmlContent.replace('{{cats}}', catsContent);

    return result;
}

async function renderAddCatPage() {
    const htmlContent = await fs.readFile('./src/views/addCat.html', 'utf-8')

    const breedOptions = readBreeds().map(breed => `<option value="${breed.id}">${breed.name}</option>`).join('\n');
    const result = htmlContent.replace('{{breedOptions}}', breedOptions);

    return result;
}

async function renderEditCatPage(catId) {
    const cat = getCatById(catId);

    if(!cat) {
        return renderNotFoundPage();
    };

    const htmlContent = await fs.readFile('./src/views/editCat.html', 'utf-8');
    const result = htmlContent.replace('{{name}}', cat.name)
        .replace('{{description}}', cat.description)
        .replace('{{imageUrl}}', cat.imageUrl);

    return result;
}

async function renderNotFoundPage() {
    return fs.readFile('./src/views/notFound.html', 'utf-8')
}

function readBodyFormData(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const formData = new URLSearchParams(body);
            resolve(formData);
        });
    });
}

server.listen(5000, () => console.log('Server is listening on http://localhost:5000...'));