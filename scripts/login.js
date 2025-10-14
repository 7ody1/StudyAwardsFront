document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const pageTitle = document.title;
            let destination = '';

            if (pageTitle.includes('Aluno')) {
                destination = 'dashboard-aluno.html';
            } else if (pageTitle.includes('Professor')) {
                destination = 'dashboard-professor.html';
            } else if (pageTitle.includes('Responsável')) {
                destination = 'dashboard-responsavel.html';
            }

            if (destination) {
                window.location.href = destination;
            }
        });
    }
});