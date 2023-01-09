export function Log(message: string, isError: boolean = false)
{
    const div = document.createElement('div');
    div.innerHTML = message;
    div.style.color = isError ? 'red' : 'black';
    document.body.appendChild(div);
}