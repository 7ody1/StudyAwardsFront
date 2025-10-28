document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o formulário de recarregar a página

            // 1. Pegar os dados dos campos de input
            // (Usamos 'email' como padrão, já que o backend espera 'email')
            const email = document.getElementById('usuario').value; 
            const senha = document.getElementById('senha').value;

            // 2. Tentar fazer o login na API do backend
            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        senha: senha
                    })
                });

                const data = await response.json();

                // 3. Verificar a resposta do backend
                if (response.ok) {
                    // SUCESSO! Login bem-sucedido

                    // 4. Salvar os dados do usuário no navegador (localStorage)
                    // Isso é MUITO importante para que as outras páginas (dashboard)
                    // saibam quem está logado.
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));

                    // 5. Redirecionar para o dashboard correto com base no TIPO
                    let destination = '';
                    if (data.usuario.tipo === 'ALUNO') {
                        destination = 'dashboard-aluno.html';
                    } else if (data.usuario.tipo === 'PROFESSOR') {
                        destination = 'dashboard-professor.html';
                    } else if (data.usuario.tipo === 'RESPONSAVEL') { // Assumindo que seu tipo é 'RESPONSAVEL'
                        destination = 'dashboard-responsavel.html';
                    }

                    if (destination) {
                        window.location.href = destination;
                    } else {
                        alert('Tipo de usuário desconhecido!');
                    }

                } else {
                    // ERRO! O backend retornou um erro (senha errada, email não encontrado)
                    alert(`Erro no login: ${data.erro}`);
                }

            } catch (error) {
                // Erro de rede (backend desligado ou CORS)
                console.error('Erro ao tentar fazer login:', error);
                alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
            }
        });
    }
});