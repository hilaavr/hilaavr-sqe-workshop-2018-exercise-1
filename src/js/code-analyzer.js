import * as esprima from 'esprima';
//import * as escodegen from 'escodegen';

/*
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};
export {parseCode};
*/
export {parseCode, parseCodeTable, parseTable};

//global objects
let listOfRows = [];
let rowObject = {
    Line: 'Line',
    Type: 'Type',
    Name: 'Name',
    Condition: 'Condition',
    Value: 'Value'
};


//original code
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};


//The function prepares a list in which each object matches a table row
const parseTable = (codeToParse) => {
    listOfRows = []; //init the list of objects
    var pcJson = esprima.parseScript(codeToParse,{loc:true});
    for (var i = 0; i<pcJson.body.length; i++)
        parseByType(pcJson.body[i]);
    return listOfRows;
};


//return string of the html table
const parseCodeTable = (codeToParse) => createHtmlTable(parseTable(codeToParse));



function parseByType(pcJson) {
    parseHandler[pcJson.type](pcJson);
}

const parseHandler =
    {   'FunctionDeclaration': handleFuncDeclaration,
        'BlockStatement': handleBlockStatement,
        'VariableDeclaration': handleVarDeclaration,
        'AssignmentExpression': handleAssignmentExp,
        'WhileStatement': handleWhileStatement,
        'ExpressionStatement': handleExpStatement,
        'IfStatement': handleIfStatement,
        'ReturnStatement': handleRetStatement,
        'ForStatement': handleForStatement,
        'UpdateExpression': calculateUpdateExp
    };


//handle functions
function handleFuncDeclaration(pcJson){
    let rowObject = {
        Line: pcJson.id.loc.start.line, Type: 'FunctionDeclaration', Name:pcJson.id.name, Condition:'', Value:''
    };
    listOfRows.push(rowObject);
    for (var i=0; i<pcJson.params.length; i++)
    {   var param =
            {
                Line: pcJson.params[i].loc.start.line,
                Type: pcJson.params[i].type,
                Name:pcJson.params[i].name,
                Condition:'',
                Value:''
            };
    listOfRows.push(param);
    }
    parseByType(pcJson.body);
}

function handleVarDeclaration(pcJson) {
    for (var i = 0; i < pcJson.declarations.length; i++) {
        var declarator =
            {
                Line: pcJson.declarations[i].id.loc.start.line,
                Type: pcJson.declarations[i].type,
                Name: pcJson.declarations[i].id.name,
                Condition: '',
                Value: calculateExpression(pcJson.declarations[i].init)
            };
        listOfRows.push(declarator);
    }
}

function handleAssignmentExp(pcJson){
    //console.log('enter func assignment');
    let rowObject = {
        Line: pcJson.loc.start.line,
        Type: pcJson.type,
        Name: pcJson.left.name,
        Condition: '',
        Value: calculateExpression(pcJson.right)
    };
    listOfRows.push(rowObject);
}

function handleBlockStatement(pcJson){
    for (var i = 0; i < pcJson.body.length; i++) {
        parseByType(pcJson.body[i]);
    }
}

function handleWhileStatement(pcJson){
    let rowObject = {
        Line: pcJson.loc.start.line,
        Type: pcJson.type,
        Name: '',
        Condition: calculateExpression(pcJson.test),
        Value: ''
    };
    listOfRows.push(rowObject);
    parseByType(pcJson.body);
}

function handleExpStatement(pcJson){//check if case AssignmentExpression
    handleAssignmentExp(pcJson.expression);
}

function handleIfStatement(pcJson){
    let rowObject = {
        Line: pcJson.loc.start.line,
        Type: pcJson.type,
        Name: '',
        Condition: calculateExpression(pcJson.test),
        Value: ''
    };
    listOfRows.push(rowObject);
    parseByType(pcJson.consequent);
    if (pcJson.alternate==null)
        return;
    else if (pcJson.alternate.type=='IfStatement')
        handleElseIfStatement(pcJson.alternate);
    else parseByType(pcJson.alternate);
}

function handleElseIfStatement(pcJson){
    let rowObject = {
        Line: pcJson.loc.start.line,
        Type: 'ElseIfStatement',
        Name: '',
        Condition: calculateExpression(pcJson.test),
        Value: ''
    };
    listOfRows.push(rowObject);
    parseByType(pcJson.consequent);
    if (pcJson.alternate==null)
        return;
    else if (pcJson.alternate.type=='IfStatement')
        handleElseIfStatement(pcJson.alternate);
    else parseByType(pcJson.alternate);
}

function handleRetStatement(pcJson){
    let rowObject = {
        Line: pcJson.loc.start.line,
        Type: pcJson.type,
        Name: '',
        Condition: '',
        Value: calculateExpression(pcJson.argument)
    };
    listOfRows.push(rowObject);
}

function handleForStatement(pcJson){
    var cond = '';
    if(pcJson.test!=null)
        cond = calculateExpression(pcJson.test);
    let rowObject = {
        Line: pcJson.loc.start.line,
        Type: pcJson.type,
        Name: '',
        Condition: cond,
        Value: ''
    };
    listOfRows.push(rowObject);
    if (pcJson.init != null)
        parseByType(pcJson.init);
    if (pcJson.update != null)
        parseByType(pcJson.update);
    parseByType(pcJson.body);
}


//calculate expressions
function calculateExpression(pcJson){
    if (pcJson==null)
        return null;
    else {
        switch (pcJson.type) {
        case 'BinaryExpression':
            return calculateBinaryExp(pcJson);
        case 'MemberExpression':
            return calculateMemberExp(pcJson);
        case 'UnaryExpression':
            return calculateUnaryExp(pcJson);
        default:
            return calculateSimpleExp(pcJson);
        }
    }
}

function calculateSimpleExp(pcJson){
    if (pcJson.type == 'Literal')
        return pcJson.raw;
    else //(pcJson.type == 'Identifier')
        return pcJson.name;
}

function calculateUpdateExp(pcJson) {
    let rowObject = {
        Line: pcJson.loc.start.line,
        Type: pcJson.type,
        Name: calculateExpression(pcJson.argument),
        Condition: '',
        Value: calculateExpression(pcJson.argument)+pcJson.operator
    };
    listOfRows.push(rowObject);
}

function calculateBinaryExp(pcJson){
    return (calculateExpression(pcJson.left) +' '+ pcJson.operator + ' '+ calculateExpression(pcJson.right));
}

function calculateMemberExp(pcJson){
    return (calculateExpression(pcJson.object) +'['+ calculateExpression(pcJson.property)+']');
}

function calculateUnaryExp(pcJson){
    return (pcJson.operator + calculateExpression(pcJson.argument));
}


//create html table from the list of objects
function createHtmlTable(listOfRows){
    listOfRows.unshift(rowObject);
    var myTable = '<table border=\'1\'>'; //open table
    for (var i =0 ; i< listOfRows.length; i++) {
        myTable += '<tr><td>'+listOfRows[i]['Line'] +'</td><td>'+
            listOfRows[i]['Type'] +'</td><td>'+
            listOfRows[i]['Name'] +'</td><td>'+
            listOfRows[i]['Condition'] +'</td><td>'+
            listOfRows[i]['Value'] +'</td></tr>';
    }
    myTable += '</table>'; //close table
    return myTable;
}

