let currentLevel = 0;
let correctAnswers = 0;
let totalQuestions = 0;
let avaliacaoSelecionada = 0;
let userAnswers = {};

// Variável global para controle
let isTouchDevice = false;

// Detecta se é um dispositivo touch
function detectTouchDevice() {
    try {
        document.createEvent("TouchEvent");
        isTouchDevice = true;
    } catch (e) {
        isTouchDevice = false;
    }
}

// Elementos do DOM
const neutralArea = document.querySelector('.neutralArea');
const areasContainer = document.querySelector('.areas');
const btnNext = document.querySelector('.btn-next');
const scoreArea = document.querySelector('.scoreArea');
const progressBar = document.querySelector('.progress--bar');
const btnRestart = document.querySelector('.btn-restart');

// Inicializa o jogo
detectTouchDevice();
initGame();

// Event listeners
btnNext.addEventListener('click', nextLevel);
btnRestart.addEventListener('click', restartGame);

// Função para inicializar o jogo
function initGame() {
    currentLevel = 0;
    correctAnswers = 0;
    totalQuestions = 0;
    userAnswers = {};

    loadLevel(currentLevel);
}

// Função utilitária para embaralhar arrays (Fisher-Yates)
function embaralhar(array) {
    for (let i = array.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para carregar um nível
function loadLevel(level) {
    if (level < game.length) {
        const currentGame = game[level];
        totalQuestions += currentGame.options.length;
        
        // Atualiza a barra de progresso
        const pct = Math.floor(((level+1) / game.length) * 100);
        progressBar.style.width = `${pct}%`;

        // Altera o texto do botão no último nível
        if (level === game.length - 1) {
            btnNext.textContent = "Mostrar resultado";
        } else {
            btnNext.textContent = "Avançar nível";
        }

        // muda a cor da barra de progresso a cada nível
        if(pct <= 33 ){
            progressBar.style.backgroundColor = "#00FF00";
        } else if(pct > 33 && pct <= 66){
            progressBar.style.backgroundColor = "#FFA500";
        } else if (pct > 66){
            progressBar.style.backgroundColor = "#FF0000";
        }
        
        // Limpa as áreas
        neutralArea.innerHTML = '';
        areasContainer.innerHTML = '';
        
        // Embaralha as opções e respostas
        const shuffledOptions = embaralhar([...currentGame.options]);
        const shuffledRespostas = embaralhar([...currentGame.respostas]);

        // Adiciona as imagens à área neutra (opções embaralhadas)
        shuffledOptions.forEach((option) => {
            const item = document.createElement('div');
            item.classList.add('item');
            item.setAttribute('draggable', 'true');
            item.setAttribute('data-id', option.id);
            item.style.backgroundImage = `url(${option.img})`;
            neutralArea.appendChild(item);
        });
        
        // Adiciona as áreas de resposta (respostas embaralhadas)
        shuffledRespostas.forEach((resposta) => {
            const area = document.createElement('div');
            area.classList.add('area');
            area.setAttribute('data-name', resposta.i);
            
            const span = document.createElement('span');
            span.textContent = resposta[Object.keys(resposta)[0]];
            
            area.appendChild(span);
            areasContainer.appendChild(area);
        });
        
        // Configura os eventos de drag and drop
        setupDragAndDrop();

        // Adiciona os listeners de toque para cada item
        document.querySelectorAll('.item').forEach(item => {
            setupTouchEvents(item);
        });

        // Esconde a área de pontuação
        scoreArea.style.display = 'none';
    } else {
        finishGame();
    }
}


// Função para configurar os eventos de drag and drop
function setupDragAndDrop() {
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);

        // Adiciona novos listeners
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });

    document.querySelectorAll('.area').forEach(area => {
        area.addEventListener('dragover', dragOver);
        area.addEventListener('dragleave', dragLeave);
        area.addEventListener('drop', drop);
    });

    neutralArea.removeEventListener('dragover', dragOverNeutral);
    neutralArea.removeEventListener('dragleave', dragLeaveNeutral);
    neutralArea.removeEventListener('drop', dropNeutral);

    neutralArea.addEventListener('dragover', dragOverNeutral);
    neutralArea.addEventListener('dragleave', dragLeaveNeutral);
    neutralArea.addEventListener('drop', dropNeutral);
}

// Funções de drag and drop
function dragStart(e) {
    e.currentTarget.classList.add('dragging');
}

function dragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    checkAnswers();
}

function dragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('hover');
}

function dragLeave(e) {
    e.currentTarget.classList.remove('hover');
}

function drop(e) {
    e.currentTarget.classList.remove('hover');
    
    if (e.currentTarget.querySelector('.item') === null) {
        const dragItem = document.querySelector('.item.dragging');
        e.currentTarget.appendChild(dragItem);
    }
}

function dragOverNeutral(e) {
    e.preventDefault();
    e.currentTarget.classList.add('hover');
}

function dragLeaveNeutral(e) {
    e.currentTarget.classList.remove('hover');
}

function dropNeutral(e) {
    e.currentTarget.classList.remove('hover');
    const dragItem = document.querySelector('.item.dragging');
    e.currentTarget.appendChild(dragItem);
    checkAnswers();
}

// Função para verificar as respostas
function checkAnswers() {
    const allItemsPlaced = document.querySelectorAll('.area .item').length === game[currentLevel].options.length;
    if (allItemsPlaced) {
        btnNext.style.display = 'block';
        
        // Rola suavemente até o botão
        btnNext.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        btnNext.style.display = 'none';
    }
    
    // Verifica respostas corretas
    document.querySelectorAll('.area').forEach(area => {
        const item = area.querySelector('.item');
        if (item) {
            const itemId = parseInt(item.getAttribute('data-id'));
            const areaId = parseInt(area.getAttribute('data-name'));
            
            // Armazena a resposta do usuário
            userAnswers[`level${currentLevel}_${areaId}`] = itemId === areaId;
        }
    });
}

// Função para avançar para o próximo nível
function nextLevel() {
    // Conta quantas respostas corretas neste nível
    const levelAnswers = Object.entries(userAnswers)
        .filter(([key]) => key.startsWith(`level${currentLevel}_`))
        .map(([_, value]) => value);
    
    correctAnswers += levelAnswers.filter(Boolean).length;
    
    currentLevel++;

    // Verifica se é o último nível para mostrar resultado
    if (currentLevel === game.length) {
        finishGame();
        progressBar.style.backgroundColor = "00FF00";
    } else {
        loadLevel(currentLevel);
        btnNext.style.display = 'none';
    }
}

// Função para finalizar o jogo
function finishGame() {
    const scorePct = Math.floor((correctAnswers / totalQuestions) * 100);

    if(scorePct < 30) {
        document.querySelector('.scoreText1').innerHTML = 'Sabe nada!';
        document.querySelector('.scorePct').style.color = "#FF0000";
        document.querySelector('.prizeImage').src = "assets/img/img-winner/trofeu-sabe-nada.webp";
    } else if (scorePct >=30 && scorePct < 50){
        document.querySelector('.scoreText1').innerHTML = 'Sabe o basico!';
        document.querySelector('.scorePct').style.color = "#FF9900";
        document.querySelector('.prizeImage').src = "assets/img/img-winner/trofeu-sabe-basico.webp";
    } else if (scorePct >=50 && scorePct < 80){
        document.querySelector('.scoreText1').innerHTML = 'Sabe muito!';
        document.querySelector('.scorePct').style.color = "#90EE90";
        document.querySelector('.prizeImage').src = "assets/img/img-winner/trofeu-bom.webp";        
    } else if (scorePct >= 80){
        document.querySelector('.scoreText1').innerHTML = 'É fanático!';
        document.querySelector('.scorePct').style.color = "#008000";
        document.querySelector('.prizeImage').src = "assets/img/img-winner/trofeu-fanatico.webp";        
    }
    
    document.querySelector('.scorePct').textContent = `Acertou ${scorePct}%`;
    document.querySelector('.scoreText2').textContent = 
        `De ${totalQuestions} jogadores você conhece ${correctAnswers}`;
    
    scoreArea.style.display = 'block';
    neutralArea.style.display = 'none';
    areasContainer.style.display = 'none';
    btnNext.style.display = 'none';
    progressBar.style.backgroundColor = "#00FF00";
    
}

// Função para reiniciar o jogo
function restartGame() {
    scoreArea.style.display = 'none';
    neutralArea.style.display = 'flex';
    areasContainer.style.display = 'flex';
    initGame();
}

// função para detectar toques em dispositivos móveis
function setupTouchEvents(item) {
    let startX, startY, offsetX, offsetY;
    let isDragging = false;
    let originalParent = item.parentNode;
    let originalPosition = item.style.position;
    let originalIndex = Array.from(originalParent.children).indexOf(item);

    item.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        
        // Guarda a posição inicial
        startX = touch.clientX;
        startY = touch.clientY;
        
        // Calcula o offset entre o toque e o canto do elemento
        const rect = item.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        
        // Prepara para arrastar
        isDragging = true;
        item.classList.add('dragging');
        
        // Move temporariamente para o body para evitar problemas de layout
        document.body.appendChild(item);
        
        // Configura o posicionamento
        item.style.position = 'fixed';
        item.style.left = (touch.clientX - offsetX) + 'px';
        item.style.top = (touch.clientY - offsetY) + 'px';
        item.style.width = rect.width + 'px'; // Mantém o tamanho original
        item.style.height = rect.height + 'px';
        
    }, { passive: false });

    item.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        
        // Atualiza a posição do elemento
        item.style.left = (touch.clientX - offsetX) + 'px';
        item.style.top = (touch.clientY - offsetY) + 'px';
        
        // Destaca áreas possíveis
        document.querySelectorAll('.area, .neutralArea').forEach(area => {
            const rect = area.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                area.classList.add('hover');
            } else {
                area.classList.remove('hover');
            }
        });
    }, { passive: false });

    item.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        isDragging = false;
        item.classList.remove('dragging');
        
        const touch = e.changedTouches[0];
        let dropped = false;
        
        // Verifica todas as áreas possíveis
        document.querySelectorAll('.area, .neutralArea').forEach(area => {
            const rect = area.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                
                area.classList.remove('hover');
                
                // Se for uma área de resposta e estiver vazia
                if (area.classList.contains('area') && area.querySelector('.item') === null) {
                    resetItemStyle();
                    area.appendChild(item);
                    dropped = true;
                } 
                // Se for a área neutra
                else if (area.classList.contains('neutralArea')) {
                    resetItemStyle();
                    area.appendChild(item);
                    dropped = true;
                }
            }
        });
        
        // Se não soltou em nenhuma área válida, volta para a posição original
        if (!dropped) {
            resetItemStyle();
            if (originalParent.children.length > originalIndex) {
                originalParent.insertBefore(item, originalParent.children[originalIndex]);
            } else {
                originalParent.appendChild(item);
            }
        }
        
        // Verifica as respostas
        checkAnswers();
        
        function resetItemStyle() {
            item.style.position = originalPosition;
            item.style.left = '';
            item.style.top = '';
            item.style.width = '';
            item.style.height = '';
            item.style.transform = '';
        }
    }, { passive: false });
}

/* Firebase */
const firebaseConfig = {
    apiKey: "AIzaSyA_NJci82viVE-wXH2gNj4ZEWmN708s6WI",
    authDomain: "youknow-606b5.firebaseapp.com",
    projectId: "youknow-606b5",
    storageBucket: "youknow-606b5.firebasestorage.app",
    messagingSenderId: "983287621066",
    appId: "1:983287621066:web:a36b889c6e45f4c0e2db33",
    measurementId: "G-3S0HRSH05Y"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const analytics = firebase.analytics();

// Obter o ID do quiz a partir do atributo data-quiz-id do <body>
const quizId = document.body.dataset.quizId || "quiz_padrao";
// Modal
function mostrarModal(mensagem) {
    document.getElementById('mensagemModal').textContent = mensagem;
    document.getElementById('feedbackModal').style.display = "block";
}

function fecharModal() {
    document.getElementById('feedbackModal').style.display = "none";
}
// Fecha o modal ao clicar fora do conteúdo
window.addEventListener('click', function(event) {
  const modal = document.getElementById('feedbackModal');
  if (event.target === modal) {
    fecharModal();
  }
});



function selecionarAvaliacao(nota) {
    avaliacaoSelecionada = nota;
    atualizarEstrelas();
}

function atualizarEstrelas() {
    const estrelas = document.querySelectorAll("#estrelas span");
    estrelas.forEach((estrela, index) => {
        if (index < avaliacaoSelecionada) {
            estrela.classList.add("selecionada");
        } else {
            estrela.classList.remove("selecionada");
        }
    });
}

function enviarAvaliacao() {
    const comentario = document.getElementById('comentarioInput').value.trim();

    if (avaliacaoSelecionada === 0) {
        mostrarModal("Por favor, selecione uma nota e escreva um comentário.");
        return;
    }

    const avaliacao = {
        nota: avaliacaoSelecionada,
        texto: comentario,
        timestamp: Date.now()
    };

    const avaliacoesRef = database.ref(`avaliacoes/${quizId}`);
    avaliacoesRef.push(avaliacao);

    document.getElementById('comentarioInput').value = "";
    avaliacaoSelecionada = 0;
    atualizarEstrelas();

    mostrarModal("Obrigado pelo seu feedback!");
}

function carregarAvaliacoes() {
    const container = document.getElementById('comentariosRecebidos');
    const mediaDiv = document.getElementById('mediaAvaliacao');
    container.innerHTML = "";
    mediaDiv.innerHTML = "";

    const avaliacoesRef = database.ref(`avaliacoes/${quizId}`);

    avaliacoesRef.on("value", function(snapshot) {
        container.innerHTML = "";
        mediaDiv.innerHTML = "";

        let soma = 0;
        let total = 0;
        const comentarios = [];

        snapshot.forEach(function(childSnapshot) {
            const av = childSnapshot.val();
            soma += av.nota;
            total++;
            comentarios.push(av);
        });

        // Mostrar os 3 mais recentes
        const ultimos3 = comentarios.slice(-3).reverse();
        ultimos3.forEach(av => {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${"⭐".repeat(av.nota)}</strong> — ${av.texto}`;
            container.appendChild(div);
        });

        if (total > 0) {
            const media = soma / total;
            const estrelasInteiras = Math.floor(media);
            const temMeiaEstrela = (media - estrelasInteiras >= 0.25) && (media - estrelasInteiras <= 0.75);
            const estrelasVazias = 5 - estrelasInteiras - (temMeiaEstrela ? 1 : 0);

            let estrelasHtml = "";

            for (let i = 0; i < estrelasInteiras; i++) {
                estrelasHtml += '<i class="fas fa-star"></i>';
            }

            if (temMeiaEstrela) {
                estrelasHtml += '<i class="fas fa-star-half-alt"></i>';
            }

            for (let i = 0; i < estrelasVazias; i++) {
                estrelasHtml += '<i class="far fa-star"></i>';
            }

            mediaDiv.innerHTML = `
                <div><strong>Média de avaliação:</strong></br>${estrelasHtml} (${media.toFixed(1)})</div>
            `;
        } else {
            mediaDiv.innerHTML = "Ainda não há avaliações.";
        }
    });
}

/*muda cor estrela hover */
function hoverEstrelas(nota) {
    const estrelas = document.querySelectorAll("#estrelas span");
    estrelas.forEach((estrela, index) => {
        estrela.style.color = index < nota ? 'gold' : 'gray';
    });
}

function resetHover() {
    const estrelas = document.querySelectorAll("#estrelas span");
    estrelas.forEach((estrela, index) => {
        estrela.style.color = index < avaliacaoSelecionada ? 'gold' : 'gray';
    });
}

// Carregar avaliações ao abrir a página
window.onload = function() {
    carregarAvaliacoes();
}