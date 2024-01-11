const express = require('express');
const app = express();

app.get('/', (request, response) => {
    response.send('hello peeps!')
})

app.listen(8080, () => console.log("listening on 8080"))