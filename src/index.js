import http from 'http';
import fs from 'fs/promises';
import cats from '../cats.js';
import { readBreeds, addBreed } from '../breedService.js';

const server = http.createServer(async (req, res) => {
    console.log(readBreeds())
    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            const formData = new URLSearchParams(body);
            const breedName = formData.get('breed');

// TO CHECK IF THERE IS A BREED THAT WE WANT TO ADD AND IF SO TO THROW NEW ERROR
            addBreed(breedName);
        });

        return res.end();
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
        htmlContent = await fs.readFile('./src/views/addCat.html', 'utf-8');
    } else {
        htmlContent = await fs.readFile('./src/views/notFound.html', 'utf-8');
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
                <li class="btn edit"><a href="">Change Info</a></li>
                <li class="btn delete"><a href="">New Home</a></li>
            </ul>
        </li>`;

    const catsContent = `<ul>${cats.map(cat => catTemplate(cat)).join('\n')}</ul>`;

    const result = htmlContent.replace('{{cats}}', catsContent);

    return result;
}

server.listen(5000, () => console.log('Server is listening on http://localhost:5000...'));