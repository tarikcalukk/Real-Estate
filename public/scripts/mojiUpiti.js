document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upitiContainer');

    PoziviAjax.getMojiUpiti((error, upiti) => {
        if (error) {
            upitiContainer.innerHTML = `<p class="error">Greška pri dohvaćanju upita: ${error.statusText}</p>`;
            return;
        }

        if (!upiti || upiti.length === 0) {
            upitiContainer.innerHTML = `<p class="info">Trenutno nemate upita.</p>`;
            return;
        }

        upiti.forEach(upit => {
            const upitElement = document.createElement('div');
            upitElement.className = 'upit';
            upitElement.innerHTML = `
                <p><strong>Datum:</strong> ${new Date(upit.datum).toLocaleDateString()}</p>
                <p><strong>Tekst upita:</strong> ${upit.tekst_upita}</p>
            `;
            upitiContainer.appendChild(upitElement);
        });
    });
});