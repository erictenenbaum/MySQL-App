require("dotenv").config();
var mysql = require('mysql');
const cTable = require('console.table');
const inquirer = require("inquirer");


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.password,
    database: 'bamazon'
});


function viewProducts(addInventory) {
    var choiceArray = [];

    connection.query("SELECT * FROM products ORDER BY department_name", function(error, results, fields) {
        if (error) throw error;
        console.table(results);

        for (let i = 0; i < results.length; i++) {
            choiceArray.push(results[i].product_name);
            // console.log(results[i].product_name)
        }



        if (addInventory) {
            addInventory(choiceArray);
            // console.log(choiceArray);

        } else {
            continuePrompt();
        }



    })


}

function viewLowProducts() {

    connection.query("SELECT product_name AS 'Products', stock_quantity AS 'Inventory' FROM products " +
        " WHERE stock_quantity <= 5",
        function(error, results, fields) {
            if (error) throw error;
            if (results) {
                console.table(results);
            } else {
                console.log("No products have low inventory right now!")

            }


            continuePrompt();
        })


}

function addInventory(userChoice) {

    inquirer.prompt([ /* Pass your questions in here */ {
                type: "list",
                message: "Please select a product you would like to add inventory to",
                choices: userChoice,
                name: "chosenProduct"

            },
            {
                type: "input",
                message: "How many units would you like to add?",
                name: "unitsAdded"
            }
        ]).then(answers => {
                // Use user feedback for... whatever!!
                // console.log(answers.chosenProduct);
                // console.log(answers.unitsAdded);

                connection.query("SELECT stock_quantity FROM products WHERE product_name=?", [answers.chosenProduct],
                    function(error, results, fields) {
                        if (error) throw error;
                        // console.log(results);
                        var updatedTotalUnits = parseInt(results[0].stock_quantity) + parseInt(answers.unitsAdded);

                        // console.log(updatedTotalUnits);
                        // continuePrompt();

                        connection.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: updatedTotalUnits
                        }, {
                            product_name: answers.chosenProduct
                        }], function(error, results, fields) {
                            if (error) throw error;
                            continuePrompt();

                        })

                    })

            })
           }

           function getDepartments() {
             connection.query("SELECT department_name FROM departments", function(error, results, fields) {
                        // console.log(results);

                        var resultsArray = [];

                        for (let i = 0; i < results.length; i++) {
                            resultsArray.push(results[i].department_name);
                        }

                        addProduct(resultsArray);
                        
                    })
                
           }

            function addProduct(departments) {

                // console.log(departments);

                    inquirer.prompt([ /* Pass your questions in here */ {
                    type: "input",
                    message: "What product would you like to add",
                    name: "addedProdcut"



                }, {
                    type: "input",
                    message: "How many units would you like to add?",
                    name: "addedUnits"
                }, {
                    type: "list",
                    message: "What department will this be added to?",
                    choices: departments,
                    name: "addedDepartment"

                }, {
                    type: "input",
                    message: "What should we sell this item for?",
                    name: "addedPrice"
                }]).then(answers => {
                    // Use user feedback for... whatever!!

                   

                    if (Number.isInteger(parseInt(answers.addedUnits)) && Number.isInteger(parseInt(answers.addedPrice))) {
                        // console.log(answers.addedUnits);
                        connection.query("INSERT INTO products SET ?", [{
                            product_name: answers.addedProdcut,
                            department_name: answers.addedDepartment,
                            stock_quantity: answers.addedUnits,
                            price: answers.addedPrice
                        }], function(error, results, fields) {
                            if (error) throw error;
                            viewProducts();
                        })
                    } else {
                        console.log("Item was not added. Please supply valid number/integer");
                        continuePrompt();
                    }



                });


                

                

            }

            function continuePrompt() {
                inquirer.prompt([ /* Pass your questions in here */ {
                    type: "confirm",
                    message: "Would you like to continue?",
                    name: "continue"
                }]).then(answers => {
                    // Use user feedback for... whatever!!

                    if (answers.continue) {
                        promptManager();
                    } else {
                        console.log("Goodbye")
                        connection.end();
                    }
                });
            }


            function promptManager() {
                inquirer.prompt([ /* Pass your questions in here */ {
                    type: "list",
                    message: "What would you like to do?",
                    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
                    name: "managerChoice"
                }]).then(answers => {
                    // Use user feedback for... whatever!!

                    switch (answers.managerChoice) {
                        case "View Products for Sale":
                            viewProducts();
                            break;

                        case "View Low Inventory":
                            viewLowProducts();
                            break;

                        case "Add to Inventory":
                            viewProducts(addInventory);
                            break;

                        case "Add New Product":
                            getDepartments();
                            break;

                        default:
                            viewProducts();
                            break;
                    }


                });
            }


            function startApp() {
                connection.connect(function(err) {
                    if (err) throw err;
                    promptManager();                                      
                    
                })
            }



            startApp();