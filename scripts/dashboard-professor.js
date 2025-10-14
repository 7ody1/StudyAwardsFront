document.addEventListener('DOMContentLoaded', () => {

    function carregarDadosProfessor() {
        fetch('../data/professor.json')
            .then(response => response.json())
            .then(data => {
                preencherStatusCards(data);
                preencherControleDePresenca(data.alunos);
                preencherRelatorioDesempenho(data.alunos);
            })
            .catch(error => {
                console.error('Erro ao carregar os dados do professor:', error);
            });
    }

    function preencherStatusCards(data) {
        document.getElementById('total-alunos').textContent = data.totalAlunos;
        document.getElementById('presentes-hoje').textContent = data.presentesHoje;
        const percentualPresenca = Math.round((data.presentesHoje / data.totalAlunos) * 100);
        document.getElementById('percentual-presenca').textContent = `${percentualPresenca}% de presença`;
        document.getElementById('atividades-ativas').textContent = data.atividadesAtivas;
    }

    function preencherControleDePresenca(alunos) {
        const listaPresenca = document.getElementById('lista-presenca');
        listaPresenca.innerHTML = '';

        alunos.forEach(aluno => {
            const itemLista = document.createElement('li');
            itemLista.className = 'student-row';

            itemLista.innerHTML = `
                <div>
                    <h4>${aluno.nome}</h4>
                    <p>${aluno.pontuacao} pontos</p>
                </div>
                <div class="presence-buttons">
                    <button class="btn-presence ${aluno.presente ? 'active' : ''}">Presente</button>
                    <button class="btn-absence ${!aluno.presente ? 'active' : ''}">Ausente</button>
                </div>
            `;
            listaPresenca.appendChild(itemLista);
        });
    }

    function preencherRelatorioDesempenho(alunos) {
        const listaDesempenho = document.getElementById('lista-desempenho');
        listaDesempenho.innerHTML = ''; 

        const alunosOrdenados = [...alunos].sort((a, b) => b.pontuacao - a.pontuacao);

        alunosOrdenados.forEach((aluno, index) => {
            const itemLista = document.createElement('li');
            itemLista.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span>${aluno.nome}</span>
                <span class="points">${aluno.pontuacao} pontos</span>
            `;
            listaDesempenho.appendChild(itemLista);
        });
    }

    carregarDadosProfessor();
});