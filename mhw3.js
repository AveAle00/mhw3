const limitResults=10
//giantbomb
const games_endpoint ='https://www.giantbomb.com/api/games/'
const api_key='ce1d982a86eb197f2c893ded9e9d0cd568f5ce89'
const platforms_endpoint='https://www.giantbomb.com/api/platforms/'
//twitch
const id_twitch='aqicdi2c2nm3ebepz0rcjgamjimgll'
const secret_twitch='bqzdjmvsvhh4nrtl8es8lu29lwf21a'
const endpoint_twitch_token='https://id.twitch.tv/oauth2/token'
const endpoint_game='https://api.twitch.tv/helix/games/top'

let platformId;
//response
function onResponse(response){
    return response.json()
}
//ricerca immagini video giochi da GiantBomb (API key)
function onGBJson(json){
	answerContainer=document.querySelector('#answerContainer')
	answerContainer.innerHTML=''
	if(json.number_of_page_results===0){
		console.log("nessun risultato")
		const textBar=document.querySelector('#text').value
		const noResults=document.createElement('h1')
		noResults.classList.add('no-margin')
		noResults.textContent="Nessun risultato per '"+textBar+"' per il dispositivo selezionato" 
		answerContainer.appendChild(noResults)
	}else
	{	console.log(json)
		const games=json.results
		for (const game of games){
		const divGame=document.createElement('div')
		divGame.classList.add('divGame')
		const imageGame=document.createElement('img')
		const nameGame=document.createElement('a')
		imageGame.src=game.image.small_url
		imageGame.classList.add('images')
		nameGame.textContent=game.name
		nameGame.href=game.site_detail_url
		divGame.appendChild(imageGame)
		divGame.appendChild(nameGame)
		answerContainer.appendChild(divGame)
		}
	}
}

// funzione che prende l'id della piattaforma selezionata
function onPlatformJson(json){
	console.log(json)
	const platforms=json.results
	const platformValue=document.querySelector('#platform').value
	const textBar=document.querySelector('#text').value
	for(const platform of platforms){
		// questo if è necessario perchè nella ricerca con PC si hanno più risultati
		if (platform.name===platformValue){ //nome nel json = valore del select
			platformId=platform.id //variabile globale = variabile nel json
		}
	}
	console.log(platformId)
	//fetch dati
	fetch(games_endpoint + '?api_key='+api_key+'&format=json&limit='+limitResults+'&filter=name:'+textBar+',platforms:'+platformId).then(onResponse).then(onGBJson)
	
}


// form di ricerca
const form=document.querySelector('#searchForm');
form.addEventListener('submit', search)
function search(event){
	event.preventDefault();
	let textBar=document.querySelector('#text').value
	console.log(textBar)
	if(textBar!==""){
		textBar=encodeURIComponent(document.querySelector('#text').value)
	}
	const platformValue=document.querySelector('#platform').value
	// questa fetch recupera gli id delle piattaforme per passarle come parametri per la fetch dati
	fetch(platforms_endpoint+'?api_key='+api_key+'&format=json&limit='+limitResults+'&filter=name:'+platformValue).then(onResponse).then(onPlatformJson)
	
}

//Oauth2 Twitch
let token; 
let header={}

function onGameJson(json){
	console.log(json)
	const listBox=document.querySelector('#listBox')
	for (game of json.data){
			const listItem=document.createElement('span')
			listItem.textContent='- '+game.name
			listBox.appendChild(listItem)
	}
}


//token twitch
function onTokenJson(json){
	console.log(json)
	token=json.access_token	
	header={
		headers:
		{
			'Authorization':'Bearer '+token,
			'Client-Id': id_twitch,
		}
	}
	fetch(endpoint_game+'?first=20',header).then(onResponse).then(onGameJson)
}
fetch(endpoint_twitch_token,
		{
			method:'POST',
			body:'grant_type=client_credentials&client_id='+id_twitch+'&client_secret='+secret_twitch,
			headers:
			{
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}).then(onResponse).then(onTokenJson)

