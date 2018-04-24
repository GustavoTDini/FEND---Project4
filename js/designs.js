
// inicio do script escondendo tela de jogo
$('.game-board').hide();

// inicialização do objeto Tile, que terá os cards
let Tile = function (x, y, face){
  this.x = x;
  this.y = y;
  this.face = face;

};

// definição de prototypo do tile para baixo, sempre com a mesma imagem
Tile.prototype.faceDown = function() {
  tileGrid = "#card" + this.y + this.x;
  $(tileGrid).attr("src","images/pokeball.png");
  this.isFaceUp = false;
}

// definição de prototypo do tile para baixo, com a respectiva imagem do array tiles
Tile.prototype.faceUp = function() {
  tileGrid = "#card" + this.y + this.x;
  $(tileGrid).attr("src",this.face);
  this.isFaceUp = true;
}

// inicialização das imagens dos cards
let allCards = [
  "Images/0-mew.png",
  "Images/1-pikachu.png",
  "Images/2-bulbasaur.png",
  "Images/3-charmander.png",
  "Images/4-squirtle.png",
  "Images/5-ivysaur.png",
  "Images/6-charmeleon.png",
  "Images/7-wartortle.png",
  "Images/8-venusaur.png",
  "Images/9-charizard.png",
  "Images/10-blastoise.png",
  "Images/11-articuno.png",
  "Images/12-zapdos.png",
  "Images/13-moltres.png",
  "Images/14-mewtwo.png",
];

let tiles = [];
let cardsflipped = [];
let time = 0;
let score = 0;
let starDown = [];
let stars = 0;
let boardSize = [];
let totalCards = [];
let matchedTiles = 0;
let totalMatches = 0;

// Função do temporizador
let countUp = function(){
  $("#time").text(time);
  time ++;
}


//let passedTime = 0;

// função que define a partir da dificuldade o tamanho do board, a definição das estrelas,
//quais cartas serão usadas, embaralha as cartas e define o total de matches para terminar o jogo
function selectDifficulty(selected){
  if (selected == "easy"){
    boardSize = [5,2];
    starDown = [10,20,40];
    totalCards = shuffleCards(allCards.slice(0,5));
    totalMatches = 5;
  } else if (selected == "medium"){
    boardSize = [5,4];
    starDown = [20,40,80];
    totalCards = shuffleCards(allCards.slice(1,11));
    totalMatches = 10;
  } else if (selected == "hard") {
    boardSize = [5,6];
    starDown = [30,60,120];
    totalMatches = 15;
    totalCards = shuffleCards(allCards.slice(0,16));
  };
}

// função para embaralhar as cartas, usei o algoritmo de Durstenfeld
function shuffleArray(array){
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
}
return array;
}

// função para definir o array de cartas como duas de cada, embaralhando com a respectiva função no final
function shuffleCards(cardArray){
  cardDeck = [];
  for (var i = 0; i < cardArray.length; i++) {
    for (let twice = 0; twice < 2; twice++) {
      cardDeck.push(cardArray[i]);
    }
  }
return shuffleArray(cardDeck);
}

// função para resetar os elementos para estarem prontos para inicio de jogo
function resetElements(){
  time = 0;
  score = 0;
  matchedTiles = 0;
  cardsflipped = [];
  stars = 3;
  tiles = [];
  $("tr").remove();
  $("#star1").show();
  $("#star2").show();
  $("#star3").show();
  $('#tries').empty().append(score);
  $('#time').empty().append(time);
  $('.start-screen').hide();
  $('.game-board').show();
  passedTime = setInterval(countUp,1000);
}

// função primaria que irá desenhar o board, com base na dificuldade e separar as cartas
// entre as colunas
function drawBoard() {
  var id;
  var face;
  resetElements();

  // pega os  tamanho do board a partir de selectDifficulty()
  selectDifficulty($(".radio-button.active").val());
  var weigth = boardSize[0];
  var heigth = boardSize[1];

  // usa os valores de cada dificuldade para produzir o board
  for (let rowIndex = 0; rowIndex < heigth; rowIndex++){
    $("#memory-board").append("<tr></tr>");
    for(let colIndex = 0; colIndex < weigth; colIndex++){
      tileId = "tile" + rowIndex + colIndex;
      $("tr").last().append('<td id="'+ tileId + '"></td>');
      imgId = "card" + rowIndex + colIndex;
      $("td").last().append('<img class="tile flipper" id="'+ imgId +'" src="" alt="'+tileId+'Image"/>')
      face = totalCards.shift();
      tiles.push(new Tile(colIndex, rowIndex, face));
    }
  }

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].faceDown();
    tiles[i].matched = false;
  }


}

// listener para definir a dificuldade a partir da escolha dos botões iniciais
// faz as vezes de um radio button
let setDiffucultyButton = $('.radio-button').click(function(){
  $('.radio-button').removeClass('active');
  $(this).addClass('active')
});

// listener para selecionar a dificuldade estabelecida pelos radio-buttons e chamar o drawBoard()
let submit = $("#dificculty-selection").submit(function(){
  if ($('.radio-button').hasClass('active')){
      drawBoard();
  }
  event.preventDefault();
});

// função que procura a carta selecionada e a vira, considera que a carta já não foi virada,
// ou que acabou de virar, no maximo 2 de cada vez
function turnTile(x,y) {
  for (var i = 0; i < tiles.length; i++) {
    if (tiles[i].x === x && tiles[i].y === y){
      if (!tiles[i].isFaceUp && !tiles[i].matched && cardsflipped.length <= 2){
        tiles[i].faceUp();
        cardsflipped.push(tiles[i]);
      }
    }
  }
}

// testa se as duas cartas são iguais, caso correto, ela modifica a propriedade matched,
//para deixar essas cartas para cima e aumento o matchedTiles
function testTile() {
  score++;
  $("#tries").text(score);
  if (cardsflipped[0].face === cardsflipped[1].face){
    cardsflipped[0].matched = true;
    cardsflipped[1].matched = true;
    cardsflipped = [];
    matchedTiles++;
  } else {
      delayFlipBack();
    }
    eraseStar();
    gameOver();
  }

// metodo para atrasar o retorno das cartas na posição para baixo, caso elas não
// façam match
function delayFlipBack(){
  setTimeout(function(){
    for (var i = 0; i < tiles.length; i++){
      if (tiles[i].matched == false){
        tiles[i].faceDown();
        cardsflipped = [];
      }
    }
  }, 1000);
}

//verifica se chegou no limite de estrela e retira uma da conta,
//atualiza tambem a stars para mostrar no modal
function eraseStar(){
  switch (score) {
    case starDown[0]:
      stars = 2;
      $("#star1").hide();
      break;
    case starDown[1]:
      stars = 1;
      $("#star2").hide();
      break;
    case starDown[2]:
      stars = 0;
      $("#star3").hide();
      break;
  }
}

// função de termino de jogo, verifica se o matchedTiles é igual ao totalMatches desta dificuldades
// caso correto, chama o modal e da a opção de reinicio
function gameOver(){
  if (matchedTiles === totalMatches){
    clearInterval(passedTime);
    $("#modal-time").empty().append(time);
    $("#modal-moves").empty().append(score);
    $("#modal-stars-container").empty();
    for (let i = 0; i < stars; i++){
      $("#modal-stars-container").append('<img class = "modal-stars" src="Images/staryu.png" alt = "modal stars ranking"/>');
    }
    $("#game-over").modal();
    let resetGame = $("#reset-button").click( function(){
      $('.start-screen').show();
      $('.game-board').hide();
    })
  };
}

//listener para definir o evento de clicar na carta, nesta função, é testada a paridade
// das cartas a pontuação de estrelas e verifica se é possivel o termino do jogo
let switchCard = $("#memory-board").on("click", "td", function() {
  let xy = $(this).attr("id");
  let x = parseInt(xy[5]);
  let y = parseInt(xy[4]);

  if (cardsflipped.length < 2){
    turnTile(x,y);
  }
  if (cardsflipped.length === 2){
    testTile();
  }
});
