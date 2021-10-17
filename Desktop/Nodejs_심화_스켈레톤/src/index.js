const app = require('./server');

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
})
