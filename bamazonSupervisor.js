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
" JOIN products p ON " +
" d.department_name = p.department_name " +
" GROUP BY d.department_id;", 
    	function(error, results, fields) {
    		if(error) throw error;
    		console.table(results);
    		continuePrompt();
    	})

}

function createDepartment() {
    
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