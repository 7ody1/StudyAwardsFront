document.addEventListener('DOMContentLoaded', () => {

    // 1. Pegar os dados do RESPONSÁVEL logado
    const usuarioLogadoString = localStorage.getItem('usuarioLogado');
    if (!usuarioLogadoString) {
        console.error('Nenhum usuário logado encontrado. Redirecionando para o login.');
        window.location.href = '../index.html';
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);

    // Verifica se é Responsável
    if (usuarioLogado.tipo !== 'RESPONSAVEL') { // Certifique-se que o TIPO no backend é 'RESPONSAVEL'
        console.error('Usuário logado não é um responsável. Acesso negado.');
        alert('Acesso negado. Esta área é apenas para responsáveis.');
        localStorage.removeItem('usuarioLogado');
        window.location.href = '../index.html';
        return;
    }

    // --- ASSUMPTION ---
    // Precisamos saber QUAL aluno este responsável deve ver.
    // Vamos ASSUMIR que o ID do aluno está salvo no localStorage também.
    // Se não estiver, precisaremos buscar isso do backend primeiro.
    // EXEMPLO: Buscando de um campo 'alunoIdAssociado' dentro do objeto salvo.
    // Adapte 'alunoIdAssociado' se o nome for diferente!
    const alunoResponsavelId = usuarioLogado.alunoIdAssociado || 1; // <<-- MUDE AQUI ou pegue dinamicamente
    // Usando '|| 1' como fallback para o Aluno 'Ana' para testar
    console.log(`Responsável logado: ${usuarioLogado.nome}, buscando dados do Aluno ID: ${alunoResponsavelId}`);
    // --- FIM DA ASSUMPTION ---


    // 2. Função para carregar os dados REAIS do ALUNO associado
    async function carregarDadosResponsavel() {
        try {
            // Monta as URLs usando o ID do ALUNO
            const urlPontuacaoAluno = `http://localhost:3000/usuarios/${alunoResponsavelId}/pontuacao`;
            const urlRanking = `http://localhost:3000/ranking`;
            // (Futuramente, buscaríamos também: urlPenalidades, urlFrequencia, urlAtividades...)

            const [respostaPontuacao, respostaRanking] = await Promise.all([
                fetch(urlPontuacaoAluno),
                fetch(urlRanking)
                // fetch(urlPenalidades), ...
            ]);

            if (!respostaPontuacao.ok || !respostaRanking.ok) {
                console.error('Erro ao buscar dados do aluno ou ranking:', respostaPontuacao.status, respostaRanking.status);
                alert('Erro ao carregar os dados do aluno. Tente recarregar.');
                return;
            }

            const dadosAluno = await respostaPontuacao.json(); // Dados do aluno específico
            const dadosRanking = await respostaRanking.json(); // Ranking geral

            // 3. Preencher a tela com os dados REAIS do ALUNO
            preencherCabecalhoAluno(dadosAluno, dadosRanking);
            preencherStatusCards(dadosAluno); // Passa os dados do aluno

            // --- NOTAS IMPORTANTES ---
            // Evolução, Atividades Recentes, Meta: Seu backend NÃO tem rotas para isso.
            // Vamos manter a lógica fake original por enquanto.
            const dadosFakeResponsavel = await fetch('../data/responsavel.json').then(res => res.json()); // Lê o JSON fake
            preencherEvolucaoDesempenho(dadosFakeResponsavel.evolucaoDesempenho); // Usa dados fake
            preencherAtividadesRecentes(dadosFakeResponsavel.atividadesRecentes); // Usa dados fake
            preencherProgressoMeta(dadosAluno, dadosFakeResponsavel.metaPontos); // Usa pontuação real + meta fake

        } catch (error) {
            console.error('Erro ao carregar os dados para o responsável:', error);
            alert('Erro de conexão ao carregar dados do dashboard do responsável.');
        }
    }

    // --- Funções para preencher a tela (Adaptadas) ---

    function preencherCabecalhoAluno(dadosAluno, dadosRanking) {
        document.getElementById('nome-aluno').textContent = dadosAluno.nome;
        // Série/Ano: Backend não fornece. Manter placeholder ou buscar de outro lugar.
        document.getElementById('serie-aluno').textContent = '...'; // Placeholder

        // Calcula o ranking do aluno
        const minhaPosicao = dadosRanking.ranking.findIndex(aluno => aluno.id === dadosAluno.id) + 1;
        if (minhaPosicao > 0) {
             document.getElementById('ranking-badge').textContent = `#${minhaPosicao} no Ranking`;
        } else {
             document.getElementById('ranking-badge').textContent = `N/A no Ranking`;
        }
    }

    function preencherStatusCards(dadosAluno) {
        document.getElementById('pontuacao-total').textContent = dadosAluno.pontuacao_total;

        // Taxa de Presença e Progresso da Meta (%): Backend não fornece. Placeholders.
        document.getElementById('taxa-presenca').textContent = `...%`; // Placeholder
        const metaPontos = 1500; // Valor fake, como no original
        const progressoMetaPercent = Math.round((dadosAluno.pontuacao_total / metaPontos) * 100);
        document.getElementById('progresso-meta').textContent = `${Math.min(progressoMetaPercent, 100)}%`; // Placeholder (calculado com meta fake)
    }

    // Funções preencherEvolucaoDesempenho e preencherAtividadesRecentes:
    // Mantidas como no original, usando dados FAKE, pois o backend não fornece esses dados.
    function preencherEvolucaoDesempenho(evolucao) {
        const performanceChart = document.getElementById('performance-chart');
        if (!performanceChart) return; // Verifica se o elemento existe
        performanceChart.innerHTML = '';
        if (!evolucao || evolucao.length === 0) return; // Verifica se há dados
        const maxPontos = Math.max(...evolucao.map(item => item.pontos), 0); // Adiciona 0 para evitar erro com array vazio

        evolucao.forEach(item => {
            const chartRow = document.createElement('div');
            chartRow.className = 'chart-row';
            const barWidth = maxPontos > 0 ? (item.pontos / maxPontos) * 100 : 0; // Evita divisão por zero

            chartRow.innerHTML = `
                <span class="month">${item.mes}</span>
                <div class="bar-container">
                    <div class="bar" style="width: ${barWidth}%;"></div>
                </div>
                <span class="points">${item.pontos} pts</span>
            `;
            performanceChart.appendChild(chartRow);
        });
    }

     function preencherAtividadesRecentes(atividades) {
        const listaAtividades = document.getElementById('recent-activities-list');
         if (!listaAtividades) return;
        listaAtividades.innerHTML = '';
         if (!atividades) return;

        atividades.forEach(atividade => {
            const itemLista = document.createElement('li');
            const statusClass = atividade.status === 'Pendente' ? 'pending' : 'positive';

            itemLista.innerHTML = `
                <div>
                    <h4>${atividade.nome}</h4>
                    <p>${atividade.data}</p>
                </div>
                <span class="points-badge ${statusClass}">${atividade.status}</span>
            `;
            listaAtividades.appendChild(itemLista);
        });
    }

    // Função para Meta: Usa pontuação REAL do aluno + meta FAKE
    function preencherProgressoMeta(dadosAluno, metaPontosFake) {
        const metaPontos = metaPontosFake || 1500; // Usa a meta fake ou 1500
        const pontuacaoAtual = dadosAluno.pontuacao_total;
        const progressoPercent = Math.round((pontuacaoAtual / metaPontos) * 100);

        document.getElementById('meta-texto').textContent = `Meta: ${metaPontos} pontos`;
        document.getElementById('meta-progresso-texto').textContent = `${pontuacaoAtual} / ${metaPontos}`;
        const progressBar = document.getElementById('meta-progress-bar');
        progressBar.style.width = `${Math.min(progressoPercent, 100)}%`; // Limita a 100%
        const pontosFaltantes = Math.max(0, metaPontos - pontuacaoAtual); // Não fica negativo
        document.getElementById('meta-incentivo').textContent = `Seu aluno está a ${pontosFaltantes} pontos de atingir a meta! Continue incentivando!`;
    }

    // Chama a função principal
    carregarDadosResponsavel();
});