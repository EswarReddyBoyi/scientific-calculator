const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const toggle = document.getElementById('modeToggle');

let currentInput = '';
let shouldResetDisplay = false;
let memory = 0;

// Cursor position support
let cursorPos = 0;

display.addEventListener('click', e => cursorPos = display.selectionStart);

function updateDisplay() {
    display.value = currentInput;
    display.setSelectionRange(cursorPos, cursorPos);
    display.focus();
}

// Toggle scientific mode
toggle.addEventListener('change', () => {
    document.querySelectorAll('.scientific-only').forEach(btn => {
        btn.style.display = toggle.checked ? 'inline-block' : 'none';
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scientific-only').forEach(btn => btn.style.display = 'none');
});

// Button clicks
buttons.forEach(btn => btn.addEventListener('click', () => {
    if(btn.classList.contains('number')) appendNumber(btn.dataset.num);
    else if(btn.classList.contains('operator')) handleOperator(btn.dataset.op);
    else if(btn.classList.contains('memory')) handleMemory(btn.dataset.op);
    else if(btn.id === 'clear') clearDisplay();
    else if(btn.id === 'equals') calculateResult();
}));

function appendNumber(num) {
    if(shouldResetDisplay){ currentInput=''; shouldResetDisplay=false; cursorPos=0; }
    currentInput = currentInput.slice(0,cursorPos) + num + currentInput.slice(cursorPos);
    cursorPos += num.length;
    updateDisplay();
}

function handleOperator(op) {
    let insertText = '';
    switch(op){
        case '√': insertText='Math.sqrt('; break;
        case '%': insertText='/100'; break;
        case '^': insertText='**'; break;
        case '!': currentInput = factorialExpression(currentInput); updateDisplay(); return;
        case 'pi': insertText=Math.PI; break;
        case 'sin': case 'cos': case 'tan': case 'log': case 'ln':
            insertText=opWrapper(op)+'('; break;
        case '(': case ')': insertText=op; break;
        default: insertText=op;
    }
    currentInput = currentInput.slice(0,cursorPos) + insertText + currentInput.slice(cursorPos);
    cursorPos += insertText.length;
    updateDisplay();
}

function opWrapper(op){
    switch(op){
        case 'sin': return 'Math.sin';
        case 'cos': return 'Math.cos';
        case 'tan': return 'Math.tan';
        case 'log': return 'Math.log10';
        case 'ln': return 'Math.log';
        default: return op;
    }
}

function factorialExpression(expr) {
    try {
        let n = eval(expr);
        if(n < 0) return '0';
        let result = 1;
        for(let i = 1; i <= n; i++) result *= i;
        return result.toString();
    } catch {
        return '0';
    }
}

function handleMemory(op){
    switch(op){
        case 'MC': memory = 0; break;
        case 'MR': appendNumber(memory); break;
        case 'M+': memory += eval(currentInput); break;
        case 'M-': memory -= eval(currentInput); break;
    }
    updateDisplay();
}

function calculateResult(){
    try{
        // Auto-close brackets
        const open = (currentInput.match(/\(/g) || []).length;
        const close = (currentInput.match(/\)/g) || []).length;
        currentInput += ')'.repeat(open - close);

        let result = Function(`return ${currentInput}`)();
        currentInput = result.toString();
        shouldResetDisplay = true;
        cursorPos = currentInput.length;
        updateDisplay();
    } catch {
        display.value = 'Error';
        currentInput = '';
        cursorPos = 0;
    }
}

function clearDisplay(){
    currentInput = '';
    cursorPos = 0;
    updateDisplay();
}

// Backspace button
const backspaceBtn = document.getElementById('backspace');
backspaceBtn.addEventListener('click', () => {
    if(cursorPos > 0){
        currentInput = currentInput.slice(0, cursorPos-1) + currentInput.slice(cursorPos);
        cursorPos--;
        updateDisplay();
    }
});

// Keyboard support
document.addEventListener('keydown', e => {
    const key = e.key;
    if(/[0-9.]/.test(key)) appendNumber(key);
    else if(['+','-','*','/','%','^','(',')'].includes(key)) handleOperator(key);
    else if(key === 'Enter') calculateResult();
    else if(key === 'Backspace'){
        e.preventDefault();
        if(cursorPos > 0){
            currentInput = currentInput.slice(0, cursorPos-1) + currentInput.slice(cursorPos);
            cursorPos--;
            updateDisplay();
        }
    }
});
