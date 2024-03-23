const express = require('express');
const ejs = require('ejs');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const path = require('path');


app.use(express.urlencoded({ extended: true }));

// Replace with your MongoDB connection string
const connectionString = 'mongodb+srv://admin:admin@myatlasclusteredu.opxelwq.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU'; 

// Connect to MongoDB
MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db('savoysummerset');
    const pricesCollection = db.collection('prices');

    // View engine setup
    app.set('view engine', 'ejs'); 
    app.set('views', path.join(__dirname, 'views'));

    // Routes
    app.get('/', (req, res) => {
      res.render('index', { title: 'Restaurant Menu' }); 
    });

    app.use(express.static(path.join(__dirname, 'public')));

      app.post('/process_prices', (req, res) => {
        const category = req.body.category;
        const item = req.body.item;
        const price = req.body.price;
    
        // Create the update document (with the new price)
        const updatedPriceDoc = {
            category: category,
            item: item,
            price: price
        };
    
        // Update or insert with upsert
        pricesCollection.updateOne(
            { item: item }, // Search by item
            { $set: updatedPriceDoc }, // Set the new data
            { upsert: true } // Insert if no document is found
        )
        .then(result => {
            if (result.matchedCount > 0) {
                console.log('Existing item price updated');
            } else {
                console.log('New price entry created'); 
            }
            res.redirect('/'); // Or your desired success page
        })
        .catch(error => console.error(error));
    });

   app.get('/menu', (req, res) => {
    const categories = [  // Array of your 13 categories 
        "breakfast", "ass", "nhp", /* ... others */
    ];

    // Fetch all prices, sort by _id descending
    pricesCollection.find() 
       .sort({ _id: -1 })
       .toArray()
       .then(allPrices => {
            const menuData = {};
            const latestPrices = {};

            // Organize by category and find the latest price
            allPrices.forEach(priceDoc => {
                const { category, item, price } = priceDoc;

                console.log('Processing priceDoc:', priceDoc); // Inspect the document

                if (!menuData[category]) {
                    menuData[category] = []; 
                }
                menuData[category].push({ item, price }); 

                const priceKey = `${category}-${item}`;
                latestPrices[priceKey] = price; 
            });

            console.log("latestPrices:", latestPrices); // Log the object

            res.render('menu', { 
                title: 'Restaurant Menu', 
                menuData, 
                categories,
                latestPrices 
            });
        })
        .catch(error => console.error(error));
});


app.get('/menu3', (req, res) => {
  const categories = [  // Array of your 13 categories 
      "breakfast", "ass", "nhp", /* ... others */
  ];

  // Fetch all prices, sort by _id descending
  pricesCollection.find() 
     .sort({ _id: -1 })
     .toArray()
     .then(allPrices => {
          const menuData = {};
          const latestPrices = {};

          // Organize by category and find the latest price
          allPrices.forEach(priceDoc => {
              const { category, item, price } = priceDoc;

              console.log('Processing priceDoc:', priceDoc); // Inspect the document

              if (!menuData[category]) {
                  menuData[category] = []; 
              }
              menuData[category].push({ item, price }); 

              const priceKey = `${category}-${item}`;
              latestPrices[priceKey] = price; 
          });

          console.log("latestPrices:", latestPrices); // Log the object

          res.render('menu', { 
              title: 'Restaurant Menu', 
              menuData, 
              categories,
              latestPrices 
          });
      })
      .catch(error => console.error(error));
});

    app.listen(8080, () => console.log('Server listening on port 8080'));
  })
  .catch(console.error);
