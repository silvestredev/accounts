//extern modules
const inquirer = require('inquirer');
const chalk = require('chalk');
//core modules
const fs = require('fs');

operation();

function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair'],
        },
    ])
    .then((answer) => { //esperar uma resposta do usuário para trabalhar com ela
        const action = answer['action']; //variável que armazena a ação do usuário.

        if(action === 'Criar Conta'){
            createAccount();
        } else if(action === 'Consultar Saldo'){
            getAccountBalance();
        } else if(action === 'Depositar'){
            deposit();
        } else if(action === 'Sacar'){
            widthdraw();
        } else if(action === 'Sair'){
            console.log(chalk.blue('Obrigado por usar o accounts!'));
            process.exit(); // encerra o programa
        };
    })
    
    .catch(err => console.log(err));

};

//create account

function createAccount() {
    console.log(chalk.bgGreen.white('Obrigado por escolher o banco Silvestre!'));
    console.log(chalk.green('Defina as opções de conta a seguir.'));

    buildAccount();
};

function buildAccount() { //criação da conta
    inquirer.prompt([
    {
        name: 'accountName',
        message: 'Digite um nome para sua conta:',
    },])
    .then((answer) => {
       console.info(answer['accountName']);
       const accountName = answer['accountName'];

       if(!fs.existsSync('accounts')){ //metódo para ver se um diretório (pasta) existe
            fs.mkdirSync('accounts'); //método para criar o diretório, caso não exista
       };

       if(fs.existsSync(`accounts/${accountName}.json`)){ //método para ver se um arquivo .json(uma conta) existe dentro de /accounts 
            console.log(chalk.bgRed('Essa conta já existe! Digite outro nome.'));
            buildAccount(accountName);
            return //quando um erro ocorre, temos que obrigatoriamente usar um return para evitar bugs
       };
       
       fs.writeFileSync(`accounts/${accountName}.json`,'{"balance":0}', (err) => console.log(err)); //criando arquivo .json

       console.log(chalk.green(`A conta foi criada com sucesso!`));
       operation();
    });
    
};

// function for add money on your acconut

function deposit() {
    inquirer.prompt([
    {
        name:'accountName',
        message: 'Qual o nome da sua conta?'
    },  
]).then((answer) => {
    const accountName = answer['accountName'];
    if(!checkAccount(accountName)) { // checando se a conta existe com a função checkAccount
        return deposit(); // caso n exista, retornar para a função deposit
    };

    inquirer.prompt([
    {
        name: 'amount', 
        message: 'Quanto você deseja depositar?'
    },
]).then((answer) => {
    const amount = answer['amount'];

    addAmount(accountName, amount);
    operation();


})
.catch(err => console.log(err))
})
.catch(err => console.log(err));
};


//função para checar se a conta existe
function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed('Essa conta nao existe! Tente novamente.'));
        return false;
    }
    return true;
};

//func adicionar dinheiro
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed('Ocorreu um erro, tente novamente mais tarde!'));
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err));

    console.log(chalk.green(`Foi depositado um valor de R$${amount} na sua conta!`));
};

//func para ler arquivo de conta
function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.JSON`, {encoding: 'utf-8', flag: 'r'}) //flag de leitura
    return JSON.parse(accountJSON);
};


// func para consultar saldo
function getAccountBalance() {
    inquirer.prompt([
    {
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }
]).then((answer) => {
    const accountName = answer['accountName'];
    //verificando se a conta existe

    if(!checkAccount(accountName)) {
        return getAccountBalance();
    };
    
    const accountData = getAccount(accountName);

    console.log(chalk.bgBlue.black(`O saldo da sua conta é de R$${accountData.balance}`));
    operation();
})
.catch(err => console.log('err'));
};

//func para sacar

function widthdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];
        //verificando se a conta existe
    
        if(!checkAccount(accountName)) {
            return widthdraw();
        };


        inquirer.prompt([
        {
            name: 'amount',
            message: 'Quanto você deseja sacar?'
        }
    ]).then((answer) => {
        const amount = answer['amount'];

        removeAmount(accountName, amount);
    })
    
    .catch(err => console.log(err));

        
    })
    .catch(err => console.log('err'));
    };


// func para remover dinheiro

function removeAmount(accountName, amount){

    const accountData = getAccount(accountName);

    if(!amount) {
        console.log(chalk.bgRed('Ocorreu um erro, tente novamente mais tarde!'));
        return widthdraw();
    };

    if(accountData.balance < amount) {
        console.log(chalk.bgRed('Valor indisponível!'));
    };


    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err));

    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`));
    operation();

}