const mongoose = require('mongoose');
const app = require('../app');

//const uri = 'mongodb+srv://stavsi:stav102102@expensetracker-nodejspr.ztpnj0f.mongodb.net/ExpenseTracker?retryWrites=true&w=majority&appName=ExpenseTracker-nodejsProject';
const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');

    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });

}).catch(err => {
    console.error('MongoDB connection error:', err);
});
