import assert from 'assert';
import {parseTable, parseCodeTable, parseCode} from '../src/js/code-analyzer';


describe('The javascript parser', () => {
    assert.equal(
        JSON.stringify(parseCode('')),
        '{"type":"Program","body":[],"sourceType":"script","loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
    );
});


describe('an empty input', () => {

    it('test1: ', () => {
        assert.equal(
            listOfObjToString(parseTable('')),
            listOfObjToString([]));
    });
});

describe('FunctionDeclaration', () => {
    it('test2: ', () => {
        assert.equal(
            listOfObjToString(parseTable('function hilaFunc(x,y,z){}')),
            listOfObjToString([{Line:'1' , Type: 'FunctionDeclaration', Name:'hilaFunc', Condition:'', Value:'' }, {Line:'1' , Type: 'Identifier', Name:'x', Condition:'', Value:'' }, {Line:'1' , Type: 'Identifier', Name:'y', Condition:'', Value:'' }, {Line:'1' , Type: 'Identifier', Name:'z', Condition:'', Value:'' }
            ]));
    });
});

describe('VariableDeclarator', () => {
    it('test3: VariableDeclarator', () => {
        assert.equal(
            listOfObjToString(parseTable('let x = 1;')),
            listOfObjToString([{Line:'1' , Type: 'VariableDeclarator', Name:'x', Condition:'', Value:'1' }]));

        assert.equal(
            listOfObjToString(parseTable('let x;')),
            listOfObjToString([{Line:'1' , Type: 'VariableDeclarator', Name:'x', Condition:'', Value:'null' }]));

        assert.equal(
            listOfObjToString(parseTable('var x = y;')),
            listOfObjToString([{Line:'1' , Type: 'VariableDeclarator', Name:'x', Condition:'', Value:'y' }]));

    });
});


describe('AssignmentExpression & ExpressionStatement:BinaryExp, UnaryExp, MemberExp', () => {
    it('test4: ', () => {
        assert.equal(
            listOfObjToString(parseTable('x = 1;')),
            listOfObjToString([{Line:'1' , Type: 'AssignmentExpression', Name:'x', Condition:'', Value:'1' }]));

        assert.equal(
            listOfObjToString(parseTable('x = y+1;')),
            listOfObjToString([{Line:'1' , Type: 'AssignmentExpression', Name:'x', Condition:'', Value:'y + 1' }]));

        assert.equal(
            listOfObjToString(parseTable('x = M[y];')),
            listOfObjToString([{Line:'1' , Type: 'AssignmentExpression', Name:'x', Condition:'', Value:'M[y]' }]));

    });
});


describe('WhileStatement', () => {
    it('test5: ', () => {
        assert.equal(
            listOfObjToString(parseTable('while (x <= y){}')),
            listOfObjToString([{Line:'1' , Type: 'WhileStatement', Name:'', Condition:'x <= y', Value:'' }]));

        assert.equal(
            listOfObjToString(parseTable('while (x == y+1)\n{x=y}')),
            listOfObjToString([{Line:'1' , Type: 'WhileStatement', Name:'', Condition:'x == y + 1', Value:'' },
                {Line:'2' , Type: 'AssignmentExpression', Name:'x', Condition:'', Value:'y'}]));

    });
});


describe('IfStatement', () => {
    it('test6: ', () => {
        assert.equal(
            listOfObjToString(parseTable('if (x<y)\n{x=y;}')),
            listOfObjToString([{Line:'1' , Type: 'IfStatement', Name:'', Condition:'x < y', Value:'' },
                {Line:'2' , Type: 'AssignmentExpression', Name:'x', Condition:'', Value:'y' }]));

        assert.equal(
            listOfObjToString(parseTable('if (x<y){}')),
            listOfObjToString([{Line:'1' , Type: 'IfStatement', Name:'', Condition:'x < y', Value:'' }]));

        assert.equal(
            listOfObjToString(parseTable('if (x<y)\n{x=y;}\nelse {y=x;}')),
            listOfObjToString([{Line:'1' , Type: 'IfStatement', Name:'', Condition:'x < y', Value:'' },
                {Line:'2' , Type: 'AssignmentExpression', Name:'x', Condition:'', Value:'y' },
                {Line:'3' , Type: 'AssignmentExpression', Name:'y', Condition:'', Value:'x' }]));

    });
});


describe('ElseIfStatement', () => {
    it('test7: ', () => {
        assert.equal(
            listOfObjToString(parseTable('if (x<10)\n{x=y;}\nelse if (x>10)\n{x=z;}\nelse {}')),
            listOfObjToString([{Line: '1', Type: 'IfStatement', Name: '', Condition: 'x < 10', Value: ''},
                {Line: '2', Type: 'AssignmentExpression', Name: 'x', Condition: '', Value: 'y'},
                {Line: '3', Type: 'ElseIfStatement', Name: '', Condition: 'x > 10', Value: ''},
                {Line: '4', Type: 'AssignmentExpression', Name: 'x', Condition: '', Value: 'z'}]));

        assert.equal(
            listOfObjToString(parseTable('if (x<10)\n{x=y;}\nelse if (x>10)\n{x=z;}')),
            listOfObjToString([{Line: '1', Type: 'IfStatement', Name: '', Condition: 'x < 10', Value: ''},
                {Line: '2', Type: 'AssignmentExpression', Name: 'x', Condition: '', Value: 'y'},
                {Line: '3', Type: 'ElseIfStatement', Name: '', Condition: 'x > 10', Value: ''},
                {Line: '4', Type: 'AssignmentExpression', Name: 'x', Condition: '', Value: 'z'}]));

    });
});


describe('ElseIfStatement_1', () => {
    it('test7_1: ', () => {
        assert.equal(
            listOfObjToString(parseTable('if (x<10)\n{x=y;}\nelse if (x>10)\n{x=z;}\nelse if (x==10)\n{}')),
            listOfObjToString([{Line: '1', Type: 'IfStatement', Name: '', Condition: 'x < 10', Value: ''},
                {Line: '2', Type: 'AssignmentExpression', Name: 'x', Condition: '', Value: 'y'},
                {Line: '3', Type: 'ElseIfStatement', Name: '', Condition: 'x > 10', Value: ''},
                {Line: '4', Type: 'AssignmentExpression', Name: 'x', Condition: '', Value: 'z'},
                {Line: '5', Type: 'ElseIfStatement', Name: '', Condition: 'x == 10', Value: ''}]));

    });
});


describe('ReturnStatement', () => {
    it('test8: ', () => {
        assert.equal(
            listOfObjToString(parseTable('function hila(x){\nreturn -1;\n}')),
            listOfObjToString([{Line: '1', Type: 'FunctionDeclaration', Name: 'hila', Condition: '', Value: ''},
                {Line: '1', Type: 'Identifier', Name: 'x', Condition: '', Value: ''},
                {Line: '2', Type: 'ReturnStatement', Name: '', Condition: '', Value: '-1'}]));

    });
});


describe('ForStatement', () => {
    it('test9: ', () => {
        assert.equal(
            listOfObjToString(parseTable('for (var i = 0; i<10; i++)\n{}')),
            listOfObjToString([{Line: '1', Type: 'ForStatement', Name: '', Condition: 'i < 10', Value: ''},
                {Line: '1', Type: 'VariableDeclarator', Name: 'i', Condition: '', Value: '0'},
                {Line: '1', Type: 'UpdateExpression', Name: 'i', Condition: '', Value: 'i++'}]));

        assert.equal(
            listOfObjToString(parseTable('for (var i = 0;; i--)\n{}')),
            listOfObjToString([{Line: '1', Type: 'ForStatement', Name: '', Condition: '', Value: ''},
                {Line: '1', Type: 'VariableDeclarator', Name: 'i', Condition: '', Value: '0'},
                {Line: '1', Type: 'UpdateExpression', Name: 'i', Condition: '', Value: 'i--'}]));

        assert.equal(
            listOfObjToString(parseTable('for (;;)\n{}')),
            listOfObjToString([{Line: '1', Type: 'ForStatement', Name: '', Condition: '', Value: ''}]));

    });
});

describe('createHtmlTable', () => {
    it('test10 : createHtmlTable', () => {
        assert.equal(parseCodeTable('x=y;'), '<table border=\'1\'><tr><td>Line</td><td>Type</td><td>Name</td><td>Condition</td><td>Value</td></tr><tr><td>1</td><td>AssignmentExpression</td><td>x</td><td></td><td>y</td></tr></table>');
    });
});




function listOfObjToString(listOfObjects){
    //console.log(listOfObjects.length);
    //console.log(listOfObjects);
    let outputList = '[';
    for (var i = 0; i < listOfObjects.length; i++ )
    {
        let obToString='';
        obToString = '{' + listOfObjects[i]['Line'] + ',' + listOfObjects[i]['Type']
            + ',' + listOfObjects[i]['Name'] + ',' +listOfObjects[i]['Condition']+ ',' +listOfObjects[i]['Value'] + '}';
        //console.log(obToString);
        outputList =outputList+ obToString;
    }
    outputList +=']';
    return outputList;
}





