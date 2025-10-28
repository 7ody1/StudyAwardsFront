document.addEventListener('DOMContentLoaded', () => {

    // 1. Pegar os dados do professor logado (salvos no login)
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    if (!usuarioLogadoString) {
        console.error('Nenhum usuário logado encontrado. Redirecionando para o login.');
        window.location.href = '../index.html';
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);

    // Verifica se é professor
    if (usuarioLogado.tipo !== 'PROFESSOR') {
        console.error('Usuário logado não é um professor. Acesso negado.');
        alert('Acesso negado. Esta área é apenas para professores.');
        localStorage.removeItem('usuarioLogado');
        window.location.href = '../index.html';
        return;
    }

    // 2. Função para carregar os dados REAIS do backend (o ranking de alunos)
    async function carregarDadosProfessor() {
        try {
            const respostaRanking = await fetch('http://localhost:3000/ranking');

            if (!respostaRanking.ok) {
                console.error('Erro ao buscar o ranking:', respostaRanking.status);
                alert('Erro ao carregar os dados do ranking.');
                return;
            }

            const dadosRanking = await respostaRanking.json(); // Ex: { ranking: [ { id: 2, nome: "Beto", ... }, ... ] }
            const alunos = dadosRanking.ranking; // A lista de alunos vinda do backend

            // 3. Preencher a tela com os dados do backend
            preencherStatusCards(alunos); // Passamos a lista de alunos para calcular totais
            preencherControleDePresenca(alunos); // Usa a lista real de alunos
            preencherRelatorioDesempenho(alunos); // Usa a lista real de alunos

        } catch (error) {
            console.error('Erro ao carregar os dados do professor:', error);
            alert('Erro de conexão ao carregar dados do dashboard do professor.');
        }
    }

    // --- Funções para preencher a tela (Adaptadas) ---

    function preencherStatusCards(alunos) {
        // Usa a lista de alunos REAL para contar o total
        const totalAlunos = alunos.length;
        document.getElementById('total-alunos').textContent = totalAlunos;

        // --- NOTAS IMPORTANTES ---
        // Presentes Hoje e Atividades Ativas: Seu backend NÃO tem rotas para isso.
        // Vamos manter valores placeholder ou buscar de outro lugar se necessário.
        document.getElementById('presentes-hoje').textContent = '...'; // Placeholder
        const percentualPresenca = '...'; // Placeholder
        document.getElementById('percentual-presenca').textContent = `${percentualPresenca}% de presença`; // Placeholder
        document.getElementById('atividades-ativas').textContent = '...'; // Placeholder
    }

    function preencherControleDePresenca(alunos) {
        const listaPresenca = document.getElementById('lista-presenca');
        listaPresenca.innerHTML = ''; // Limpa a lista antiga

        // Usa a lista de alunos REAL vinda do backend
        alunos.forEach(aluno => {
            const itemLista = document.createElement('li');
            itemLista.className = 'student-row';

            // Nota: O backend atual não informa se o aluno está 'presente' hoje.
            // Os botões vão começar desmarcados. A lógica para MARCAR presença
            // precisaria chamar uma NOVA rota no backend (que ainda não criamos).
            itemLista.innerHTML = `
                <div>
                    <h4>${aluno.nome}</h4>
                    <p>${aluno.pontuacao_total} pontos</p> 
                </div>
                <div class="presence-buttons" data-aluno-id="${aluno.id}">
                    <button class="btn-presence">Presente</button> 
                    <button class="btn-absence">Ausente</button>
                </div>
            `;
            listaPresenca.appendChild(itemLista);
        });

        // Adicionar lógica para os botões de presença (exemplo básico)
        listaPresenca.querySelectorAll('.presence-buttons button').forEach(button => {
            button.addEventListener('click', (event) => {
                const clickedButton = event.target;
                const parentDiv = clickedButton.parentElement;
                const alunoId = parentDiv.dataset.alunoId;

                // Remove 'active' de ambos os botões do mesmo aluno
                parentDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                // Adiciona 'active' ao botão clicado
                clickedButton.classList.add('active');

                const estaPresente = clickedButton.classList.contains('btn-presence');
                console.log(`Aluno ID: ${alunoId}, Presente: ${estaPresente}`);
                // Aqui você chamaria a API do backend para registrar a presença/falta
                // Ex: fetch(`http://localhost:3000/presenca`, { method: 'POST', ... })
            });
        });
    }

    function preencherRelatorioDesempenho(alunos) {
        const listaDesempenho = document.getElementById('lista-desempenho');
        listaDesempenho.innerHTML = ''; // Limpa a lista antiga

        // A lista de alunos do backend JÁ VEM ORDENADA por pontuação (do maior para o menor)
        alunos.forEach((aluno, index) => {
            const itemLista = document.createElement('li');
            itemLista.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span>${aluno.nome}</span>
                <span class="points">${aluno.pontuacao_total} pontos</span>
            `;
            listaDesempenho.appendChild(itemLista);
        });
    }

    // Chama a função principal para carregar os dados
    carregarDadosProfessor();
});