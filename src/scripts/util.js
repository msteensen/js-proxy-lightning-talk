export function Log(message, isError = false) {
    const div = document.createElement('div');
    div.innerHTML = message;
    div.style.color = isError ? 'red' : 'black';
    document.body.appendChild(div);
}
