document.addEventListener('DOMContentLoaded', () => {

    fetch('../data/aluno.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('saudacao-aluno').textContent = `Olá, ${data.nome}!`;
            document.getElementById('pontuacao-valor').textContent = data.pontuacaoTotal;
            document.getElementById('ranking-valor').textContent = `#${data.ranking}`;
            document.getElementById('ranking-total').textContent = `de ${data.totalAlunos} alunos`;
            document.getElementById('presenca-valor').textContent = `${data.presenca}%`;
        })
        .catch(error => {
            console.error('Erro ao carregar os dados do aluno:', error);
        });

});