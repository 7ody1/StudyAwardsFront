document.addEventListener('DOMContentLoaded', () => {

    // 1. Pegar os dados do usuário que foram salvos no login
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    
    // Se não encontrar os dados, redireciona de volta para o login (segurança)
    if (!usuarioLogadoString) {
        console.error('Nenhum usuário logado encontrado. Redirecionando para o login.');
        window.location.href = '../index.html'; // Ou para a página de login específica
        return; // Para a execução do script
    }

    // Converte a string JSON de volta para um objeto JavaScript
    const usuarioLogado = JSON.parse(usuarioLogadoString);

    // Verifica se o usuário é mesmo um ALUNO
    if (usuarioLogado.tipo !== 'ALUNO') {
        console.error('Usuário logado não é um aluno. Acesso negado.');
        // Poderia redirecionar para uma página de erro ou login
        alert('Acesso negado. Esta área é apenas para alunos.');
        localStorage.removeItem('usuarioLogado'); // Limpa o login inválido
        window.location.href = '../index.html';
        return;
    }

    // Temos o usuário logado (ex: { id: 14, nome: "Aluno Teste", ... })

    // 2. Função para buscar os dados ATUAIS do aluno no backend
    async function carregarDadosAluno() {
        try {
            // Monta a URL da API usando o ID do usuário logado
            const urlPontuacao = `http://localhost:3000/usuarios/${usuarioLogado.id}/pontuacao`;
            const urlRanking = `http://localhost:3000/ranking`;

            // Faz as chamadas para o backend ao mesmo tempo
            const [respostaPontuacao, respostaRanking] = await Promise.all([
                fetch(urlPontuacao),
                fetch(urlRanking)
            ]);

            // Verifica se as respostas foram OK
            if (!respostaPontuacao.ok || !respostaRanking.ok) {
                console.error('Erro ao buscar dados do backend:', respostaPontuacao.status, respostaRanking.status);
                alert('Erro ao carregar os dados do dashboard. Tente recarregar a página.');
                return;
            }

            // Pega os dados JSON das respostas
            const dadosPontuacao = await respostaPontuacao.json(); // Ex: { id: "14", nome: "Aluno Teste", pontuacao_total: 0 }
            const dadosRanking = await respostaRanking.json();     // Ex: { ranking: [ { id: 2, ... }, { id: 1, ... } ] }

            // 3. Preencher a tela com os dados REAIS do backend
            document.getElementById('saudacao-aluno').textContent = `Olá, ${dadosPontuacao.nome}!`;
            document.getElementById('pontuacao-valor').textContent = dadosPontuacao.pontuacao_total;

            // Encontrar a posição do aluno no ranking
            const minhaPosicao = dadosRanking.ranking.findIndex(aluno => aluno.id === usuarioLogado.id) + 1;
            const totalAlunos = dadosRanking.ranking.length;

            if (minhaPosicao > 0) {
                document.getElementById('ranking-valor').textContent = `#${minhaPosicao}`;
                document.getElementById('ranking-total').textContent = `de ${totalAlunos} alunos`;
            } else {
                document.getElementById('ranking-valor').textContent = `N/A`; // Caso não encontre no ranking
                document.getElementById('ranking-total').textContent = `de ${totalAlunos} alunos`;
            }

            // ---- NOTAS IMPORTANTES ----
            // Presença: Seu backend atual NÃO tem uma rota para buscar a % de presença.
            // Vamos deixar um valor fixo ou '...' por enquanto.
            document.getElementById('presenca-valor').textContent = `...%`; // <-- Placeholder

            // Meta Mensal, Histórico de Presença, Atividades:
            // Esses dados também NÃO vêm do backend atual.
            // O código original preenchia com dados fake. Vamos mantê-los assim por enquanto
            // ou comentar/remover essas seções se preferir simplificar.
            // (O código abaixo mantém a lógica fake original para essas partes)

            // --- Código FAKE para Meta Mensal (Exemplo) ---
            const metaPontos = 1500; // Valor fixo
            const progressoMeta = Math.round((dadosPontuacao.pontuacao_total / metaPontos) * 100);
            document.querySelector('.progress-info span:nth-child(2)').textContent = `${dadosPontuacao.pontuacao_total} / ${metaPontos} pontos`;
            document.querySelector('.progress-bar').style.width = `${Math.min(progressoMeta, 100)}%`; // Não passa de 100%
            document.querySelector('.meta-description').textContent = `Você está a ${Math.max(0, metaPontos - dadosPontuacao.pontuacao_total)} pontos de atingir sua meta!`;

            // Histórico de Presença e Atividades continuam como estavam no HTML original

        } catch (error) {
            console.error('Erro ao carregar os dados do aluno:', error);
            alert('Erro de conexão ao carregar os dados do dashboard.');
        }
    }

    // Chama a função para carregar os dados quando a página carregar
    carregarDadosAluno();

});