document.addEventListener('DOMContentLoaded', () => {

    function carregarDadosResponsavel() {
        fetch('../data/responsavel.json')
            .then(response => response.json())
            .then(data => {
                preencherCabecalhoAluno(data);
                preencherStatusCards(data);
                preencherEvolucaoDesempenho(data.evolucaoDesempenho);
                preencherAtividadesRecentes(data.atividadesRecentes);
                preencherProgressoMeta(data);
            })
            .catch(error => {
                console.error('Erro ao carregar os dados do responsável:', error);
            });
    }

    function preencherCabecalhoAluno(data) {
        document.getElementById('nome-aluno').textContent = data.nomeAluno;
        document.getElementById('serie-aluno').textContent = data.serieAluno;
        document.getElementById('ranking-badge').textContent = `#${data.ranking} no Ranking`;
    }

    function preencherStatusCards(data) {
        document.getElementById('pontuacao-total').textContent = data.pontuacaoTotal;
        document.getElementById('taxa-presenca').textContent = `${data.taxaPresenca}%`;
        document.getElementById('progresso-meta').textContent = `${data.progressoMeta}%`;
    }

    function preencherEvolucaoDesempenho(evolucao) {
        const performanceChart = document.getElementById('performance-chart');
        performanceChart.innerHTML = '';
        const maxPontos = Math.max(...evolucao.map(item => item.pontos));

        evolucao.forEach(item => {
            const chartRow = document.createElement('div');
            chartRow.className = 'chart-row';
            const barWidth = (item.pontos / maxPontos) * 100;

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
        listaAtividades.innerHTML = '';

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
    
    function preencherProgressoMeta(data) {
        document.getElementById('meta-texto').textContent = `Meta: ${data.metaPontos} pontos`;
        document.getElementById('meta-progresso-texto').textContent = `${data.pontuacaoTotal} / ${data.metaPontos}`;
        const progressBar = document.getElementById('meta-progress-bar');
        progressBar.style.width = `${data.progressoMeta}%`;
        const pontosFaltantes = data.metaPontos - data.pontuacaoTotal;
        document.getElementById('meta-incentivo').textContent = `Seu aluno está a ${pontosFaltantes} pontos de atingir a meta! Continue incentivando!`;
    }


    carregarDadosResponsavel();
});