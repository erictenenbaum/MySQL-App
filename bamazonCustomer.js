require("dotenv").config();
var mysql      = require('mysql');
const cTable = require('console.table');
const inquirer = require("inquirer");


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : process.env.password,
  database : 'bamazon'
});
 


// function queryDB(command) {

// 	connection.connect();
 
// connection.query(command, function (error, results, fields) {
//   if (error) throw error;
//   console.log(results);
// });
 
// connection.end();

// }

function continuePrompt() {
	inquirer.prompt([/* Pass your questions in here */{
		type: "confirm",
		message: "Would you like to continue shopping?",
		name: "continue"
	}]).then(answers => {
    // Use user feedback for... whatever!!

    	if(answers.continue) {
    		displayItems();
    	}
    	else {
    		console.log("Thank you for shopping!")
    		connection.end();
    	}
});
}

function updateDB(newQuantity, productName, newSalesTotal) {
	connection.query("UPDATE products SET ? WHERE ?",
		[{
			stock_quantity: newQuantity,
			product_sales: newSalesTotal
		}, {
			product_name: productName
		}], function(error, results, fields) {
			if (error) throw error;
			

			continuePrompt();
		})
}

function checkAvailability(item, quantity) {
	connection.query("SELECT stock_quantity, price, product_sales FROM products WHERE product_name=?", [item], 
		function(error, results, fields) {
		if(error) throw error;
		// console.log(results);

		var itemsLeft = results[0].stock_quantity;
		let itemPrice = results[0].price;
		let totalSale = itemPrice * quantity;
		let productSales = results[0].product_sales;
		let updatedProductSales = productSales + totalSale;

			if((itemsLeft - quantity) > 1) {

				if(quantity > 1) {
					console.log("You just bought " + quantity + " " +  item + "s" + " for $" + totalSale);
				}
				else {
					console.log("You just bought a " + item + " for $" + itemPrice);
				}
				

				updateDB(itemsLeft - quantity, item, updatedProductSales);
			}

			else {
				console.log("Sorry, insufficient quantity!");
			}
	})
}


function displayItems() {
	var choiceArray = [];

	connection.query("SELECT product_name AS 'Product', price AS 'Sales Price', stock_quantity AS 'Available Items' FROM products", 
		function(error, results, fields) {
		if(error) throw error;
		console.table(results);

		for (let i = 0; i < results.length; i++) {
			choiceArray.push(results[i].Product);
			// console.log(results[i].product_name)
		}

		// return choiceArray;

		promptCustomer(choiceArray);

	})

}

// queryDB("SELECT item_id, product_name, price, stock_quantity FROM products");


function startApp () {
	connection.connect(function(err) {
		if(err) throw err;
		// promptCustomer();
		displayItems();
	})

	// promptCustomer();
}

function promptCustomer(itemChoices) {

	// console.log(itemChoices);

	inquirer.prompt([/* Pass your questions in here */{
		type: "list",
		message: "What would you like to buy?",
		choices: itemChoices,
		name: "purchasedItem"

	}, {
		type: "input",
		message: "How many would you like to buy?",
		name: "purchasedQuantity"
	}]).then(answers => {
    // Use user feedback for... whatever!!
    	// console.log(answers.purchasedItem);
    	if(Number.isInteger(parseInt(answers.purchasedQuantity))) {
    		checkAvailability(answers.purchasedItem, answers.purchasedQuantity);
    	}
    	else {
    		console.log("Item not purchased, please enter a valid number/integer");
    		continuePrompt();
    	}

    	

    	// connection.end();

});
}

startApp();
