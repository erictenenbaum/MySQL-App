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



function viewSalesByDepartment() {
    connection.query("SELECT d.department_id, d.department_name, SUM(d.over_head_cost) AS total_over_head, " +
        " SUM(p.product_sales) AS total_product_sales, " +
        " SUM(p.product_sales) - SUM(d.over_head_cost) AS total_profit " +
        " FROM departments d " +
        " INNER JOIN products p ON " +
        " d.department_name = p.department_name " +
        " GROUP BY d.department_id;",
        function(error, results, fields) {
            if (error) throw error;
            console.table(results);
            continuePrompt();
        })

}

function createDepartment() {
    inquirer.prompt([ /* Pass your questions in here */ {
            type: "input",
            message: "What would you like to name the new department?",
            name: "departmentName"
        },
        {
            type: "input",
            message: "How much overhead does this department have?",
            name: "overhead"
        }
    ]).then(answers => {
        // Use user feedback for... whatever!!

        if (Number.isInteger(parseInt(answers.overhead))) {
            connection.query("INSERT INTO departments SET ?", [{
                department_name: answers.departmentName,
                over_head_cost: answers.overhead
            }], function(error, results, fields) {
                if (error) throw error;

                // thow a function here asking if user wants to add a product
                addPrompt(answers.departmentName);
            })
        } else {
            console.log("Department was not added, please input a valid number/integer");
            continuePrompt();
        }

    });
}

function addPrompt(departmentName) {
    inquirer.prompt([ /* Pass your questions in here */ {
        type: "confirm",
        message: "Would you like to add a product to this department?",
        name: "addAnswer"
    }]).then(answers => {
        // Use user feedback for... whatever!!
        if (answers.addAnswer) {
            addProduct(departmentName);
        } else {
            continuePrompt();
        }

    });

}

function addProduct(departmentName) {

    inquirer.prompt([ /* Pass your questions in here */ {
            type: "input",
            message: "What product would you like to add",
            name: "addedProdcut"
        },{
            type: "input",
            message: "How many units would you like to add?",
            name: "addedUnits"
        },
        {
            type: "input",
            message: "What should we sell this item for?",
            name: "addedPrice"
        }
    ]).then(answers => {
        // Use user feedback for... whatever!!

        // console.log(answers.addedProdcut);
        // console.log(answers.addedUnits);

        if (Number.isInteger(parseInt(answers.addedUnits)) && Number.isInteger(parseInt(answers.addedPrice))) {
            // console.log(answers.addedUnits);
            connection.query("INSERT INTO products SET ?", [{
                product_name: answers.addedProdcut,
                department_name: departmentName,
                stock_quantity: answers.addedUnits,
                price: answers.addedPrice
            }], function(error, results, fields) {
                if (error) throw error;
                continuePrompt();
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
            promptSupervisor();
        } else {
            console.log("Goodbye")
            connection.end();
        }
    });
}

function promptSupervisor() {
    inquirer.prompt([ /* Pass your questions in here */ {
        type: "list",
        message: "What would you like to do?",
        choices: ["View Sales by Department", "Create Department"],
        name: "supervisorChoice"
    }]).then(answers => {
        // Use user feedback for... whatever!!
        if (answers.supervisorChoice == "View Sales by Department") {
            viewSalesByDepartment();
        } else {
            createDepartment();
        }
    });

}

function startApp() {
    connection.connect(function(err) {
        if (err) throw err;
        promptSupervisor();
    });
}

startApp();