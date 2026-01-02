const express = require("express");
const app = express();

app.use(express.urlencoded({extended: false }));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', require('./routes/admin'));

app.listen(3000, () => {
    console.log('Server running on port 3000');
});